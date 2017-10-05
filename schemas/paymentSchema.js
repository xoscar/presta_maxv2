// dependencies
const mongoose = require('mongoose');
const objectMapper = require('object-mapper');
const moment = require('moment-timezone');

module.exports = new mongoose.Schema({
  amount: Number,
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports.mappings = {
  info: body => (
    objectMapper(body, {
      loan_id: 'loan_id',
      id: 'id',
      amount: 'amount',
      created: [
        { key: 'created_from_now', transform: val => moment(val).fromNow() },
        { key: 'created', transform: val => moment(val).format('DD/MM/YYYY HH:mm') },
      ],
    })
  ),
  create: body => (
    objectMapper(body, {
      amount: 'amount',
      created: { key: 'created', transform: () => Date.now() },
    })
  ),
  update: body => (
    objectMapper(body, {
      created: { key: 'created', transform: val => moment(val, 'DD/MM/YYYY HH:mm').toDate() },
      amount: 'amount',
    })
  ),
};
