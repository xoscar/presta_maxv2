const common = require('../utils/common');
const mongoose = require('mongoose');
const Response = require('../utils/response');
const Counter = require('./Counter');
const ö = require('validator');
const moment = require('moment');

moment.locale('es');

function prepareQuery(terms, finished) {
  const query = terms.map(term => ({
    search: {
      $regex: term,
      $options: 'i',
    },
  }));

  query.push({
    finished,
  });

  return query;
}

const paymentSchema = new mongoose.Schema({
  amount: Number,
  created: {
    type: Date,
    default: Date.now,
  },
});

paymentSchema.methods.getBasicInfo = function getBasicInfo(loan) {
  return {
    loan_id: loan.id,
    id: this.id,
    amount: this.amount,
    created_from_now: moment(this.created).fromNow(),
    created: moment(this.created).format('DD/MM/YYYY HH:mm'),
  };
};

const loanSchema = new mongoose.Schema({
  number_id: Number,
  amount: Number,
  weekly_payment: Number,
  file: String,
  description: String,
  client_name: String,
  client_identifier: String,
  finished_date: Date,
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  finished: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  weeks: Number,
  expired_date: Date,
  search: Array,
  client_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId,
  payments: [paymentSchema],
});

const availableRequests = [{
  fields: '_id'.split(' '),
  params: 'id'.split(' '),
}];

function validateData(query) {
  const errors = new Response('error');

  if (!query) {
    errors.push('query', 'Invalid request.');
  }

  if (!query.amount || !ö.isNumeric(String(query.amount))) {
    errors.push('amount', 'La cantidad debe ser numerica.');
  }

  if (!query.weekly_payment || !ö.isNumeric(String(query.weekly_payment))) {
    errors.push('weekly_payment', 'El pago semanal debe de ser numerico.');
  }

  if (!query.weeks || !ö.isNumeric(String(query.weeks))) {
    errors.push('weeks', 'El numero de semanas debe de ser numerico.');
  }

  if (!query.client_id || !ö.isMongoId(query.client_id)) {
    errors.push('client_id', 'El número de identificación del cliente es invalido.');
  }

  if (query.created && moment(query.created, 'DD/MM/YYYY HH:mm').toDate().toString() === 'Invalid Date') {
    errors.push('created', 'La fecha de creación no es válida.');
  }

  if (errors.messages.length === 0) {
    if (parseInt(query.weeks, 10) < 0 && parseInt(query.weeks, 10) > 60) {
      errors.push('weeks', 'El número de semanas debe ser entre 1 y 60');
    }

    if (parseInt(query.amount, 10) <= parseInt(query.weeks, 10)) {
      errors.push('amount', 'El número de semanas debe de ser menor al de la cantidad total del prestamo.');
    }

    if (parseInt(query.amount, 10) <= parseInt(query.weekly_payment, 10)) {
      errors.push('amount', 'El pago semanal debe de ser menor a la cantidad total del prestamo.');
    }

    return errors;
  }

  return errors;
}

loanSchema.pre('save', function preSave(next) {
  const searchFields = 'amount weeks client_id _id client_identifier client_name number_id'.split(' ');

  this.search = common.generateArrayFromObject(this, searchFields);
  this.expired_date = moment(this.created)
    .endOf('week')
    .add(this.weeks, 'weeks')
    .endOf('week')
    .toDate();

  this.updated = Date.now();
  this.finished = this.getCurrentBalance() === 0 ?
    this.finished = true :
    this.finished = false;

  if (this.finished && !this.finished_date) this.finished_date = moment().toDate();

  if (this.isNew) {
    Counter.findOne({ name: 'loans' }, (err, counter) => {
      counter.getNext((nextErr, value) => {
        if (!nextErr || value) {
          this.number_id = value;
          this.search.push(this.number_id.toString());
        }

        next();
      });
    });
  } else next();
});

loanSchema.methods.isExpired = function isExpired() {
  return moment().isAfter(this.expired_date) && !this.finished;
};

loanSchema.methods.getCurrentWeek = function getCurrentWeek() {
  if (moment().diff(this.created, 'weeks') > (this.weeks + 1)) {
    return null;
  }

  return moment().diff(this.created, 'weeks') + 1;
};

loanSchema.methods.getPayments = function getPayments() {
  const payments = this.payments.sort((a, b) => (
    moment(b.created).isAfter(a.created) ? 1 : 0
  ));

  return payments.map(payment => (
    payment.getBasicInfo(this)
  ));
};

loanSchema.methods.getBasicInfo = function getBasicInfo() {
  const result = {
    id: this.id,
    number_id: this.number_id,
    amount: this.amount,
    description: this.description,
    weekly_payment: this.weekly_payment,
    created: moment(this.created).format('DD/MM/YYYY HH:mm'),
    created_from_now: moment(this.created).fromNow(),
    current_week: this.getCurrentWeek(),
    weeks: this.weeks,
    last_payment: this.getLastPayment(),
    last_payment_from_now: this.getLastPayment() ? moment(this.getLastPayment()).fromNow() : null,
    expired: this.isExpired(),
    expired_date: moment(this.expired_date).format('DD/MM/YYYY HH:mm'),
    expired_date_from_now: moment(this.expired_date).fromNow(),
    finished: this.finished,
    finished_date: this.finished_date ? moment(this.finished_date).format('DD/MM/YYYY HH:mm') : null,
    updated: moment(this.updated).format('DD/MM/YYYY HH:mm'),
    current_balance: this.getCurrentBalance(),
    client_id: this.client_id,
  };

  result.payments = this.getPayments();

  return result;
};

loanSchema.methods.update = function update(query, callback) {
  const errors = validateData(query);

  if (errors.messages.length === 0) {
    this.amount = query.amount;
    this.weekly_payment = query.weekly_payment;
    this.weeks = query.weeks;
    this.description = query.description;
    this.client_id = query.client_id;
    this.created = query.creaded ? moment(query.created, 'DD/MM/YYYY HH:mm').toDate() : this.created;
    this.save(callback);
  } else callback(errors);
};

loanSchema.methods.getLastPayment = function getLastPayment() {
  if (this.payments.length === 0) {
    return null;
  }

  const orderedPayments = this.payments.sort((a, b) => (
    moment(a.created).isAfter(b.created) ? 1 : -1
  ));

  return orderedPayments[orderedPayments.length - 1].created;
};

loanSchema.methods.getCurrentBalance = function getCurrentBalance() {
  return this.amount - this.payments.map(payment => (
    parseInt(payment.amount, 10)
  )).reduce((a, b) => (
    a + b
  ), 0);
};

loanSchema.methods.delete = function deleteLoan(callback) {
  this.remove(callback);
};

loanSchema.methods.createPayment = function createPayment(query, callback) {
  const errors = new Response('error');

  if (Object.keys(query).length === 0) {
    errors.push('query', 'Invalid request.');
  }

  if (!query.amount || !ö.isNumeric(String(query.amount))) {
    errors.push('amount', 'La cantidad del pago debe de ser numerica.');
    return callback(errors);
  }

  if (this.getCurrentBalance() - query.amount < 0) {
    errors.push('payment', 'El abono es mayor a la cantidad del saldo del prestamo');
  }

  if (this.getCurrentBalance() === 0) {
    errors.push('payment', 'El prestamo ya fue saldado.');
  }

  if (errors.messages.length === 0) {
    const newPayment = {
      amount: query.amount,
      created: Date.now(),
    };

    this.payments.push(newPayment);

    return this.save(callback);
  }

  return callback(errors);
};

loanSchema.methods.updatePayment = function updatePayment(paymentId, query, callback) {
  const errors = new Response('error');

  if (Object.keys(query).length === 0) {
    errors.push('query', 'Invalid request.');
  }

  if (!paymentId || !ö.isMongoId(paymentId)) {
    errors.push('payment_id', 'El identificador del prestamo no es correcto.');
  }

  if (!query.amount || !ö.isNumeric(String(query.amount))) {
    errors.push('amount', 'La cantidad del pago debe de ser numerica.');
  }

  if (this.getCurrentBalance() - query.amount < 0) {
    errors.push('payment', 'El prestamo ya fue saldado.');
  }

  if (query.created && moment(query.created, 'DD/MM/YYYY HH:mm').toDate().toString() === 'Invalid Date') {
    errors.push('created', 'La fecha de creación no es válida.');
  }

  if (errors.messages.length === 0) {
    const foundPayment = this.payments.filter(payment => (
      payment.id === paymentId
    ))[0];

    if (!foundPayment) {
      errors.push('payment', 'Pago no encontrado.');
      return callback(errors);
    }

    foundPayment.created = query.created ? moment(query.created, 'DD/MM/YYYY HH:mm').toDate() : this.created;
    foundPayment.amount = query.amount;

    return this.save(callback);
  }

  return callback(errors);
};

loanSchema.methods.deletePayment = function deletePayment(query, callback) {
  const errors = new Response('error');

  if (!query.paymentId || !ö.isMongoId(query.paymentId)) {
    errors.push('paymentId', 'Not a valid payment id.');
  }

  if (errors.messages.length === 0) {
    this.payments = this.payments.filter(payment => (
      payment.id !== query.paymentId
    ));

    this.save(callback);
  } else callback(errors);
};

loanSchema.methods.getPayment = function getPayment(paymentId) {
  const foundPayment = this.payments.filter(payment => (
    payment.id === paymentId
  ))[0];

  if (!foundPayment) return null;
  return foundPayment.getBasicInfo(this);
};

loanSchema.statics.create = function create(user, client, query, callback) {
  const errors = validateData(query);

  if (errors.messages.length === 0) {
    const newLoan = new this({
      amount: query.amount,
      weekly_payment: query.weekly_payment,
      weeks: query.weeks,
      description: query.description,
      client_id: query.client_id,
      client_name: client.name + ' ' + client.surname,
      client_identifier: client.client_id,
      user_id: user.id,
    });

    return newLoan.save(callback);
  }

  return callback(errors);
};

loanSchema.statics.getFromRequest = function getFromRequest(req, res, next) {
  const query = common.getQueryFromRequest(availableRequests, req);
  if (!query) {
    return res.status(400).send('Invalid request.');
  }

  if (req.user) {
    query.user_id = req.user.id;
  }

  return mongoose.model('loans', loanSchema).findOne(query, (err, doc) => {
    if (err || !doc) {
      return res.status(404).send('Not found.');
    }

    req.loan = doc;

    return next();
  });
};

loanSchema.statics.search = function search(searchTerms, finished, userId, limit, skip, callback) {
  const andQuery = prepareQuery(searchTerms, finished);

  this
    .find({
      $and: andQuery,
    })
    .where('user_id')
    .equals(userId)
    .limit(limit)
    .skip(skip)
    .sort({
      created: -1,
    })
    .exec(callback);
};

loanSchema.statics.delete = function deleteLoan(clientId, callback) {
  this
    .find({ client_id: clientId })
    .remove()
    .exec(callback);
};

loanSchema.index({
  _id: 1,
});

loanSchema.index({
  created: -1,
});

loanSchema.index({
  client_id: -1,
});

loanSchema.index({
  created: -1,
  user_id: 1,
});

loanSchema.index({
  search: 1,
});

module.exports.Loan = mongoose.model('loans', loanSchema);
module.exports.Payment = mongoose.model('payments', paymentSchema);
