// dependencies
const mongoose = require('mongoose');
const objectMapper = require('object-mapper');
const moment = require('moment-timezone');

// schemas
const paymentSchema = require('./paymentSchema');

module.exports = new mongoose.Schema({
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


module.exports.mappings = {
  info: body => (
    objectMapper(body, {
      id: 'id',
      number_id: 'number_id',
      amount: 'amount',
      description: 'description',
      weekly_payment: 'weekly_payment',
      created: [
        { key: 'created', transform: val => moment(val).format('DD/MM/YYYY HH:mm') },
        { key: 'created_from_now', transform: val => moment(val).fromNow() },
      ],
      current_week: { key: 'current_week', transform: () => body.getCurrentWeek() },
      weeks: 'weeks',
      last_payment: { key: 'last_payment', transform: () => body.getLastPayment() },
      last_payment_from_now: { key: 'last_payment_from_now', transform: () => (body.getLastPayment() ? moment(body.getLastPayment()).fromNow() : null) },
      expired: { key: 'expired', transform: () => body.isExpired() },
      expired_date: { key: 'expired_date', transform: val => moment(val).format('DD/MM/YYYY HH:mm') },
      expired_date_from_now: { key: 'expired_date_from_now', transform: val => moment(val).fromNow() },
      finished: 'finished',
      finished_date: { key: 'finished_date', transform: val => (val ? moment(val).format('DD/MM/YYYY HH:mm') : null) },
      updated: { key: 'updated', transform: val => moment(val).format('DD/MM/YYYY HH:mm') },
      current_balance: { key: 'current_balance', transform: () => body.getCurrentBalance() },
      client_id: 'client_id',
      payments: { key: 'payments', transform: () => body.getPayments() },
    })
  ),
  update: body => (
    objectMapper(body, {
      amount: 'amount',
      weekly_payment: 'weekly_payment',
      weeks: 'weeks',
      description: 'description',
      client_id: 'client_id',
      created: { key: 'creaded', transform: val => (val ? moment(val, 'DD/MM/YYYY HH:mm').toDate() : null) },
    })
  ),
  create: body => (
    objectMapper(body, {
      amount: 'amount',
      weekly_payment: 'weekly_payment',
      weeks: 'weeks',
      description: 'description',
      client_id: 'client_id',
      userId: 'user_id',
    })
  ),
};
