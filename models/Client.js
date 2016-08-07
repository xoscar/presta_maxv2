const mongoose = require('mongoose');
const common = require('../utils/common');
const Loan = require('./Loan').Loan;
const Charge = require('./Charge');
const Async = require('async');
const moment = require('moment');
const Response = require('../utils/response');

moment.locale('es');

var clientSchema = new mongoose.Schema({
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
}, ];

function validateData(query) {
  var errors = new Response('error');
  if (!query) errors.push('query', 'Invalid request.');
  if (!query.name)
    errors.push('name', 'Not a valid name.');
  if (!query.surname)
    errors.push('surname', 'Not a valid surname.');
  if (!query.address)
    errors.push('address', 'Not a valid address.');
  if (!query.phone)
    errors.push('phone', 'Not a valid phone.');
  return errors;
}

function prepareQuery(terms) {
  var query = [];
  terms.forEach(function (term) {
    query.push({
      search: {
        $regex: term,
        $options: 'i',
      },
    });
  });

  return query;
}

clientSchema.pre('save', function (next) {
  var _this = this;
  var searchFields = 'name client_id surname'.split(' ');
  _this.search = common.generateArrayFromObject(_this, searchFields);
  _this.updated = Date.now();
  next();
});

clientSchema.methods.getInfo = function (callback) {
  var _this = this;
  var result = {
    name: this.name.split(' ')[0].toLowerCase(),
    name_complete: this.name.toLowerCase(),
    surname: this.surname.toLowerCase(),
    created: moment(_this.created).fromNow(),
    updated: this.updated,
    address: this.address,
    phone: this.phone,
    id: this._id,
    client_id: this.client_id,
  };

  Async.waterfall([
    function getLoans(wfaCallback) {
      _this.getLoans((err, loans, extra) => {
        if (err) return wfaCallback(err);
        result.active_loans = loans;
        result.total_depth = extra.total;
        result.last_payment = extra.last_payment;
        result.last_loan = extra.last_loan;
        result.expired_loans = extra.expired;
        wfaCallback();
      });
    },

    function getCharges(wfaCallback) {
      _this.getCharges((err, charges) => {
        if (err) return wfaCallback(err);
        result.charges = charges;
        wfaCallback();
      });
    },

  ], (err) => callback(err, result));
};

clientSchema.methods.getCharges = function (callback) {
  Charge
    .find({
      client_id: this.id,
      paid: false,
    })
    .sort({ created: -1 })
    .exec((err, charges) => {
      if (err) return callback(err);
      Async.map(charges, (charge, mapaCallback) => {
        mapaCallback(null, charge.getInfo());
      }, callback);
    });
};

clientSchema.methods.getLoans = function (callback) {
  var _this = this;
  var extra = {
    total: 0,
    last_payment_holder: moment().subtract(4, 'year'),
    last_loan_holder: moment().subtract(4, 'year'),
    last_payment: null,
    last_loan: null,
    expired: false,
  };
  Loan
    .find({
      client_id: _this.id,
    })
    .sort({ created: -1 })
    .exec((err, docs) => {
      if (err) return callback(err);
      Async.map(docs, (loan, mapaCallback) => {
        var info = loan.getBasicInfo();
        if (!extra.expired) extra.expired = info.expired;
        if (info.last_payment && moment(info.last_payment).isAfter(extra.last_payment_holder))
          extra.last_payment = moment(info.last_payment).fromNow();

        if (moment(info.created).isAfter(extra.last_loan_holder))
          extra.last_loan = moment(info.created).fromNow();

        extra.total += info.current_balance;
        mapaCallback(null, info);
      }, (err, loans) => {
        callback(err, loans, extra);
      });
    });
};

clientSchema.methods.deleteLoans = function (callback) {
  Loan.delete(this.id, callback);
};

clientSchema.methods.update = function (query, callback) {
  var errors = validateData(query);
  if (errors.messages.length === 0) {
    this.name = query.name;
    this.surname = query.surname;
    this.address = query.address;
    this.phone = query.phone;
    this.save(callback);
  } else callback(errors);
};

clientSchema.methods.delete = function (callback) {
  var _this = this;
  this.deleteLoans((err) => {
    if (err) callback(err);
    else _this.remove(callback);
  });
};

clientSchema.statics.create = function (user, query, callback) {
  var errors = validateData(query);
  if (errors.messages.length === 0) {
    var clientId = query.name.slice(0, 2).toUpperCase() +
      query.surname.slice(0, 2).toUpperCase();
    this
      .find({
        client_id: { $regex: new RegExp(clientId + '[0-9]') },
        user_id: user.id,
      })
      .select('client_id')
      .exec((err, docs) => {
        if (err) {
          errors.push('application', 'Processing error.');
          callback(errors);
        } else {
          var number = 1;
          docs.forEach((doc, index) => {
            number = index + 2;
          });

          var newClient = new this({
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

clientSchema.statics.getFromRequest = function (req, res, next) {
  var query = common.getQueryFromRequest(availableRequests, req);
  if (!query) return res.status(400).send('Invalid request.');
  if (req.user) query.user_id = req.user.id;
  mongoose.model('clients', clientSchema).findOne(query, function (err, doc) {
    if (err || !doc) return res.status(400).send('Not found.');
    req.client = doc;
    next();
  });
};

clientSchema.statics.search = function (searchTerms, userId, limit, skip, callback) {
  var andQuery = prepareQuery(searchTerms);
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

module.exports = mongoose.model('clients', clientSchema);
