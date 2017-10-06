// dependencies
const mongoose = require('mongoose');
const objectMapper = require('object-mapper');
const moment = require('moment-timezone');

module.exports = new mongoose.Schema({
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

module.exports.mappings = {
  info: body => (
    objectMapper(body || {}, {
      updated: 'updated',
      address: 'address',
      phone: 'phone',
      id: 'id',
      client_id: 'client_id',
      name: { key: 'name', transform: val => val.split(' ')[0].toLowerCase() },
      surname: { key: 'surname', transform: val => val.toLowerCase() },
      name_complete: { key: 'name_complete', transform: () => `${body.name} ${body.surname}`.toLowerCase() },
      created: [
        { key: 'created', transform: val => moment(val).format('DD/MM/YYYY HH:mm') },
        { key: 'created_from_now', transform: val => moment(val).fromNow() },
      ],
    })
  ),
  update: body => (
    objectMapper(body || {}, {
      name: 'name',
      surname: 'surname',
      address: 'address',
      phone: 'phone',
    })
  ),
  create: body => (
    objectMapper(body || {}, {
      name: 'name',
      surname: 'surname',
      address: 'address',
      phone: 'phone',
      user_id: 'user_id',
    })
  ),
};
