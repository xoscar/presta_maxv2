const mongoose = require('mongoose');
const common = require('../utils/common');
const Loan = require('./Loan').Loan;
const Async = require('async');
const moment = require('moment');

moment.locale('es');

var clientSchema = new mongoose.Schema({
  client_id: String,
  name: String,
  surname: String,
  created: {
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
}, {
  fields: 'client_id'.split(' '),
  params: 'client'.split(' '),
}, ];

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

  next();
});

clientSchema.methods.getInfo = function (callback) {
  var _this = this;
  var result = _this.toObject();
  result.created = moment(_this.created).fromNow();
  _this.getLoans((err, loans, extra) => {
    result.active_loans = loans;
    result.total_depth = extra.total;
    result.last_payment = extra.last_payment;
    result.last_loan = extra.last_loan;
    result.expired_loans = extra.expired ? 'Si' : 'No';
    callback(err, result);
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
      finished: false,
    })
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

clientSchema.statics.getFromRequest = function (req, res, next) {
  var query = common.getQueryFromRequest(availableRequests, req);
  if (req.headers.user) query.user = req.headers.user;
  if (!query) return res.status(400).send('Invalid request.');

  mongoose.model('clients', clientSchema).find(query, function (err, doc) {
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
