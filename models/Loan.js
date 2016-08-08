const common = require('../utils/common');
const mongoose = require('mongoose');
const Response = require('../utils/response');
const ö = require('validator');
const moment = require('moment');
moment.locale('es');

function prepareQuery(terms, finished) {
  var query = [];
  terms.forEach(function (term) {
    query.push({
      search: {
        $regex: term,
        $options: 'i',
      },
    });
  });

  query.push({
    finished: finished,
  });

  return query;
}

var paymentSchema = new mongoose.Schema({
  amount: Number,
  created: {
    type: Date,
    default: Date.now,
  },
});

var loanSchema = new mongoose.Schema({
  amount: Number,
  weekly_payment: Number,
  file: String,
  description: String,
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
}, ];

function validateData(query) {
  var errors = new Response('error');
  if (!query) errors.push('query', 'Invalid request.');
  if (!query.amount || !ö.isNumeric(query.amount))
    errors.push('amount', 'La cantidad debe ser numerica.');
  if (!query.weekly_payment || !ö.isNumeric(query.weekly_payment))
    errors.push('weekly_payment', 'El pago semanal debe de ser numerico.');
  if (!query.weeks || !ö.isNumeric(query.weeks))
    errors.push('weeks', 'El numero de semanas debe de ser numerico.');
  if (!query.client_id || !ö.isMongoId(query.client_id))
    errors.push('client_id', 'El número de identificación del cliente es invalido.');

  if (errors.messages.length === 0) {
    if (parseInt(query.weeks) < 0 && parseInt(query.weeks > 60))
      errors.push('weeks', 'El número de semanas debe ser entre 1 y 60');
    if (parseInt(query.amount) <= parseInt(query.weeks))
      errors.push('amount', 'El número de semanas debe de ser menor al de la cantidad total del prestamo.');
    if (parseInt(query.amount) <= parseInt(query.weekly_payment))
      errors.push('amount', 'El pago semanal debe de ser menor a la cantidad total del prestamo.');
    return errors;
  } else return errors;
}

loanSchema.pre('save', function (next) {
  var searchFields = 'amount weeks client_id _id'.split(' ');
  this.search = common.generateArrayFromObject(this, searchFields);
  this.updated = Date.now();
  this.finished = this.getCurrentBalance() === 0 ?
    this.finished = true :
    this.finished = false;
  next();
});

loanSchema.methods.isExpired = function () {
  var expired = false;
  if (moment().isAfter(this.expired_date) && !this.finished)
    expired = true;
  return expired;
};

loanSchema.methods.getBasicInfo = function () {
  var result = {
    id: this.id,
    amount: this.amount,
    description: this.description,
    weekly_payment: this.weekly_payment,
    created: moment(this.created).format('DD/MM/YYYY HH:mm'),
    created_from_now: moment(this.created).fromNow(),
    weeks: this.weeks,
    last_payment: this.getLastPayment(),
    last_payment_from_now: this.getLastPayment() ? moment(this.getLastPayment()).fromNow() : null,
    expired: this.isExpired(),
    expired_date: moment(this.expired_date).format('DD/MM/YYYY HH:mm'),
    expired_date_from_now: moment(this.expired_date).fromNow(),
    finished: this.finished,
    updated: moment(this.updated).format('DD/MM/YYYY HH:mm'),
    current_balance: this.getCurrentBalance(),
  };

  result.payments = this.payments.map(function (payment) {
    return {
      id: payment.id,
      amount: payment.amount,
      created_from_now: moment(payment.created).fromNow(),
      created: moment(payment.created).format('DD/MM/YYY HH:mm'),
    };
  });

  return result;
};

loanSchema.methods.update = function (query, callback) {
  var errors = validateData(query);
  if (errors.messages.length === 0) {
    this.amount = query.amount;
    this.weekly_payment = query.weekly_payment;
    this.weeks = query.weeks;
    this.description = query.description;
    this.client_id = query.client_id;
    this.expired_date = moment(this.created).add(query.weeks, 'week').toDate();
    this.save(callback);
  } else callback(errors);
};

loanSchema.methods.getInfo = function () {
  return this.getBasicInfo();
};

loanSchema.methods.getLastPayment = function () {
  if (this.payments.length === 0)
    return null;
  var orderedPayments = this.payments.sort(function (a, b) {
    return moment(a.created).isAfter(b.created) ? 1 : -1;
  });

  return orderedPayments[orderedPayments.length - 1].created;
};

loanSchema.methods.getCurrentBalance = function () {
  var totalPayments = 0;
  if (this.payments.length > 0)
    this.payments.forEach(function (a) {
      totalPayments += parseInt(a.amount);
    });

  return this.amount - totalPayments;
};

loanSchema.methods.delete = function (callback) {
  this.remove(callback);
};

loanSchema.methods.createPayment = function (user, query, callback) {
  var errors = new Response('error');
  if (Object.keys(query).length === 0) errors.push('query', 'Invalid request.');
  if (!query.amount || !ö.isNumeric(query.amount))
    errors.push('amount', 'The amount has to be numeric.');
  if (this.getCurrentBalance() === 0)
    errors.push('payment', 'This loan has been paid already.');
  if (errors.messages.length === 0) {
    var newPayment = {
      amount: query.amount,
      created: Date.now(),
    };

    this.payments.push(newPayment);

    this.save(callback);
  } else callback(errors);
};

loanSchema.methods.deletePayment = function (query, callback) {
  var errors = new Response('error');
  if (!query.paymentId || !ö.isMongoId(query.paymentId))
    errors.push('paymentId', 'Not a valid payment id.');
  if (errors.messages.length === 0) {
    var paymentsHolder = [];
    this.payments.forEach((payment) => {
      if (payment.id !== query.paymentId)
        paymentsHolder.push(payment);
    });

    this.payments = paymentsHolder;

    this.save(callback);
  } else callback(errors);
};

loanSchema.statics.create = function (user, query, callback) {
  var errors = validateData(query);
  if (errors.messages.length === 0) {
    var newLoan = new this({
      amount: query.amount,
      weekly_payment: query.weekly_payment,
      weeks: query.weeks,
      expired_date: moment().add(query.weeks, 'week').toDate(),
      description: query.description,
      client_id: query.client_id,
      user_id: user.id,
    });
    newLoan.save(callback);
  } else callback(errors);
};

loanSchema.statics.getFromRequest = function (req, res, next) {
  var query = common.getQueryFromRequest(availableRequests, req);
  if (!query) return res.status(400).send('Invalid request.');
  if (req.user) query.user_id = req.user.id;
  mongoose.model('loans', loanSchema).findOne(query, function (err, doc) {
    if (err || !doc) return res.status(400).send('Not found.');
    req.loan = doc;
    next();
  });
};

loanSchema.statics.search = function (searchTerms, finished, userId, limit, skip, callback) {
  var andQuery = prepareQuery(searchTerms, finished);
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

loanSchema.statics.delete = function (clientId, callback) {
  this
    .find({ client_id: clientId })
    .remove()
    .exec(callback);
};

module.exports.Loan = mongoose.model('loans', loanSchema);
module.exports.Payment = mongoose.model('payments', paymentSchema);
