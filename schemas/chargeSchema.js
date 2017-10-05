// dependencies
const mongoose = require('mongoose');
const objectMapper = require('object-mapper');
const moment = require('moment-timezone');

module.exports = new mongoose.Schema({
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

module.exports.mappings = {
  create: body => (
    objectMapper(body, {
      user_id: 'user_id',
      amount: 'amount',
      created: {
        key: 'created',
        default: Date.now(),
      },
      client_id: 'client_id',
      description: 'description',
    })
  ),
  update: body => (
    objectMapper(body, {
      amount: 'amount',
      created: 'created',
      description: 'description',
    })
  ),
  info: body => (
    objectMapper(body, {
      id: 'id',
      amount: 'amount',
      description: 'description',
      weeks: 'weeks',
      paid: 'paid',
      created: [
        { key: 'created_from_now', transform: val => moment(val).fromNow() },
        { key: 'created', transform: val => moment(val).format('DD/MM/YYYY HH:mm') },
      ],
      expired: { key: 'expired', transform: () => !(moment().isAfter(body.expired_date) && !body.finished) },
      paid_date: { key: 'paid_date', transform: val => (val ? moment(val).format('DD/MM/YYYY HH:mm') : null) },
    })
  ),
};
