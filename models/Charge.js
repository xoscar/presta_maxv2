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
  description: String,
  paid_date: Date,
  paid: {
    type: Boolean,
    default: false,
  },
  client_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId,
});

function validateCreationData(query) {
  var errors = new Response('error');
  if (!query) errors.push('query', 'Invalid request.');
  if (!query.amount || !ö.isNumeric(query.amount))
    errors.push('amount', 'La cantidad debe ser numerica.');
  if (!query.client_id || !ö.isMongoId(query.client_id))
    errors.push('client_id', 'El número de identificación del cliente es invalido.');
  if (query.created && moment(query.created, 'DD/MM/YYYY HH:mm').toDate().toString() === 'Invalid Date')
    errors.push('created', 'La fecha de creación no es válida.');

  return errors;
}

function validateUpdateData(query) {
  var errors = new Response('error');
  if (!query) errors.push('query', 'Invalid request.');
  if (!query.amount || !ö.isNumeric(query.amount))
    errors.push('amount', 'La cantidad debe ser numerica.');
  if (query.created && moment(query.created, 'DD/MM/YYYY HH:mm').toDate().toString() === 'Invalid Date')
    errors.push('created', 'La fecha de creación no es válida.');
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
    description: this.description,
    created: moment(this.created).format('DD/MM/YYYY HH:mm'),
    created_from_now: moment(this.created).fromNow(),
    weeks: this.weeks,
    paid: this.paid,
    paid_date: this.paid_date ? moment(this.paid_date).format('DD/MM/YYYY HH:mm') : null,
  };
};

chargeSchema.methods.update = function (query, callback) {
  var errors = validateUpdateData(query);
  if (errors.messages.length === 0) {
    this.amount = query.amount;
    this.created = moment(query.created, 'DD/MM/YYYY HH:mm').toDate();
    this.description = query.description;
    this.save(callback);
  } else callback(errors);
};

chargeSchema.methods.pay = function (callback) {
  this.paid = true;
  this.paid_date = Date.now();
  this.save(callback);
};

chargeSchema.statics.create = function (user, query, callback) {
  var errors = validateCreationData(query);
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
    if (err || !doc) return res.status(404).send('Not found.');
    console.log(doc);
    req.charge = doc;
    next();
  });
};

chargeSchema.index({
  created: -1,
});

chargeSchema.index({
  client_id: 1,
});

chargeSchema.index({
  created: -1,
  user_id: 1,
});

module.exports = mongoose.model('charges', chargeSchema);
