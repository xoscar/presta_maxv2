const mongoose = require('mongoose');
const common = require('../utils/common');
const moment = require('moment');
const Response = require('../utils/response');
const ö = require('validator');

var chargeSchema = new mongoose.Schema({
  amount: Number,
  expiration_date: Date,
  created: {
    type: Date,
    default: Date.now,
  },
  weeks: Number,
  description: String,
  paid: {
    type: Boolean,
    default: false,
  },
  client_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId,
});

function validateData(query) {
  var errors = new Response('error');
  if (!query) errors.push('query', 'Invalid request.');
  if (!query.amount || !ö.isNumeric(query.amount))
    errors.push('amount', 'The amount has to be numeric.');
  if (!query.weeks || !ö.isNumeric(query.weeks))
    errors.push('weeks', 'Not a valid week number.');
  if (!query.client_id || !ö.isMongoId(query.client_id))
    errors.push('client_id', 'Not a valid client id.');
  return errors;
}

const availableRequests = [{
  fields: '_id'.split(' '),
  params: 'id'.split(' '),
}, ];

chargeSchema.methods.isExpired = function () {
  var expired = false;
  if (moment().isAfter(this.expired_date) && !this.finished)
    expired = true;
  return expired;
};

chargeSchema.methods.getInfo = function () {
  return {
    id: this.id,
    expired: this.isExpired(),
    amount: this.amount,
    created: this.created,
    weeks: this.weeks,
    paid: this.paid,
  };
};

chargeSchema.methods.pay = function (callback) {
  this.paid = true;
  this.save(callback);
};

chargeSchema.statics.create = function (user, query, callback) {
  var errors = validateData(query);
  if (errors.messages.length === 0) {
    var newCharge = new this({
      amount: query.amount,
      weeks: query.weeks,
      expired_date: moment().add(query.weeks, 'week').toDate(),
      description: query.description,
      client_id: query.client_id,
      user_id: user.id,
    });
    newCharge.save(callback);
  } else callback(errors);
};

chargeSchema.statics.getFromRequest = function (req, res, next) {
  var query = common.getQueryFromRequest(availableRequests, req);
  if (!query) return res.status(400).send('Invalid request.');
  if (req.user) query.user_id = req.user.id;
  mongoose.model('charges', chargeSchema).findOne(query, function (err, doc) {
    if (err || !doc) return res.status(400).send('Not found.');
    req.charge = doc;
    next();
  });
};

module.exports = mongoose.model('charges', chargeSchema);
