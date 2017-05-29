'use strict';

const mongoose = require('mongoose');
const common = require('../utils/common');
const Loan = require('./Loan').Loan;
const Charge = require('./Charge');
const Async = require('async');
const moment = require('moment');
const Response = require('../utils/response');

moment.locale('es');

const clientSchema = new mongoose.Schema({
  client_id: String,
  name: String,
  surname: String,
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  address: String,
  phone: String,
  search: Array,
  user_id: mongoose.Schema.Types.ObjectId,
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

  if (!query.name) {
    errors.push('name', 'El nombre ingresado no es válido.');
  }

  if (!query.surname) {
    errors.push('surname', 'El apellido ingresado no es válido.');
  }

  if (!query.address) {
    errors.push('address', 'La dirección ingresada no es válida.');
  }

  if (!query.phone) {
    errors.push('phone', 'El teléfono ingresado no es válido.');
  }

  return errors;
}

const prepareQuery = terms => (
  terms.map(term => ({
    search: {
      $regex: term,
      $options: 'i',
    },
  }))
);

clientSchema.pre('save', function preSave(next) {
  const searchFields = 'name client_id surname'.split(' ');
  this.search = common.generateArrayFromObject(this, searchFields);
  this.updated = Date.now();

  next();
});

clientSchema.methods.getBasicInfo = function getBasicInfo() {
  return {
    name: this.name.split(' ')[0].toLowerCase(),
    name_complete: this.name.toLowerCase(),
    surname: this.surname.toLowerCase(),
    created: moment(this.created).format('DD/MM/YYYY HH:mm'),
    created_from_now: moment(this.created).fromNow(),
    updated: this.updated,
    address: this.address,
    phone: this.phone,
    id: this._id, // eslint-ignore
    client_id: this.client_id,
  };
};

clientSchema.methods.getInfo = function getInfo(callback) {
  const result = this.getBasicInfo();

  Async.waterfall([
    (wfaCallback) => {
      this.getLoans(false, (err, loans, extra) => {
        if (err) return wfaCallback(err);
        result.loans = loans;
        result.active_loans = loans.length !== 0;
        result.loans_depth = extra.total;
        result.total_depth = extra.total;

        if (extra.last_payment) {
          result.last_payment = extra.last_payment.format('DD/MM/YYYY HH:mm');
          result.last_payment_from_now = extra.last_payment.fromNow();
        }

        if (extra.last_loan) {
          result.last_loan = extra.last_loan.format('DD/MM/YYYY HH:mm');
          result.last_loan_from_now = extra.last_loan.fromNow();
        }

        result.expired_loans = extra.expired;
        return wfaCallback();
      });
    },

    (wfaCallback) => {
      this.getLoans(true, (err, loans) => {
        if (err) return wfaCallback(err);
        result.finished_loans = loans;

        return wfaCallback();
      });
    },

    (wfaCallback) => {
      this.getCharges(false, (err, charges, total) => {
        if (err) return wfaCallback(err);
        result.charges = charges;
        result.total_depth += total;
        result.charges_depth = total;

        return wfaCallback();
      });
    },

    (wfaCallback) => {
      this.getCharges(true, (err, charges) => {
        if (err) return wfaCallback(err);
        result.paid_charges = charges;

        return wfaCallback();
      });
    },
  ], err => (
    callback(err, result)
  ));
};

clientSchema.methods.getCharges = function getCharges(paid, callback) {
  let totalDepth = 0;

  Charge
    .find({
      client_id: this.id,
      paid,
    })
    .sort({ created: -1 })
    .exec((err, charges) => {
      if (err) return callback(err);

      return Async.map(charges, (charge, mapaCallback) => {
        totalDepth += charge.amount;
        mapaCallback(null, charge.getInfo());
      }, (resError, result) => {
        callback(resError, result, totalDepth);
      });
    });
};

clientSchema.methods.getLoans = function getLoans(finished, callback) {
  const extra = {
    total: 0,
    last_payment_holder: moment().subtract(4, 'year'),
    last_loan_holder: moment().subtract(4, 'year'),
    last_payment: null,
    last_loan: null,
    expired: false,
  };

  const match = {
    client_id: this.id,
    finished,
  };

  Loan
    .find(match)
    .sort({ created: -1 })
    .exec((err, docs) => {
      if (err) return callback(err);

      return Async.map(docs, (loan, mapaCallback) => {
        const info = loan.getBasicInfo();

        if (!extra.expired) extra.expired = info.expired;
        if (info.last_payment && moment(info.last_payment).isAfter(extra.last_payment_holder)) {
          extra.last_payment_holder = moment(info.last_payment);
          extra.last_payment = moment(info.last_payment);
        }

        if (moment(info.created, 'DD/MM/YYYY HH:mm').isAfter(extra.last_loan_holder.toDate())) {
          extra.last_loan_holder = moment(info.created, 'DD/MM/YYYY HH:mm');
          extra.last_loan = moment(info.created, 'DD/MM/YYYY HH:mm');
        }

        extra.total += info.current_balance;
        mapaCallback(null, info);
      }, (resultError, loans) => {
        callback(resultError, loans, extra);
      });
    });
};

clientSchema.methods.deleteLoans = function deleteLoans(callback) {
  Loan.delete(this.id, callback);
};

clientSchema.methods.update = function update(query, callback) {
  const errors = validateData(query);

  if (errors.messages.length === 0) {
    this.name = query.name;
    this.surname = query.surname;
    this.address = query.address;
    this.phone = query.phone;
    this.save(callback);
  } else callback(errors);
};

clientSchema.methods.delete = function deleteClient(callback) {
  this.deleteLoans((err) => {
    if (err) callback(err);
    else this.remove(callback);
  });
};

clientSchema.statics.create = function create(user, query, callback) {
  const errors = validateData(query);

  if (errors.messages.length === 0) {
    const clientId = query.name.slice(0, 2).toUpperCase() +
      query.surname.slice(0, 2).toUpperCase();

    this.find({
      client_id: { $regex: new RegExp(clientId + '[0-9]') },
      user_id: user.id,
    })

    .select('client_id')

    .exec((err, docs) => {
      if (err) {
        errors.push('application', 'Processing error.');
        callback(errors);
      } else {
        let number = 1;
        docs.forEach((doc, index) => {
          number = index + 2;
        });

        const newClient = new this({
          name: query.name,
          surname: query.surname,
          address: query.address,
          phone: query.phone,
          user_id: user.id,
          client_id: clientId + number,
        });

        newClient.save(callback);
      }
    });
  } else callback(errors);
};

clientSchema.statics.getFromRequest = function getFromRequest(req, res, next) {
  const query = common.getQueryFromRequest(availableRequests, req);
  if (!query) return res.status(400).send('Invalid request.');
  if (req.user) query.user_id = req.user.id;

  return mongoose.model('clients', clientSchema).findOne(query, (err, doc) => {
    if (err || !doc) return res.status(404).send('Not found.');

    req.client = doc;
    return next();
  });
};

clientSchema.statics.search = function search(searchTerms, userId, limit, skip, callback) {
  const andQuery = prepareQuery(searchTerms);

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

clientSchema.index({
  _id: 1,
});

clientSchema.index({
  created: -1,
});

clientSchema.index({
  created: -1,
  user_id: 1,
});

clientSchema.index({
  search: 1,
});

module.exports = mongoose.model('clients', clientSchema);
