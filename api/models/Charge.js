// dependencies
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const validator = require('validator');

// schema
const chargeSchema = require('../schemas/chargeSchema');

const mappings = chargeSchema.mappings;

chargeSchema.statics.validateCreate = (body = {}) => {
  const errors = [];
  const createBody = mappings.create(body);

  if (!createBody.amount || !validator.isNumeric(createBody.amount)) {
    errors.push({
      code: 'amount',
      text: 'La cantidad debe ser numerica.',
    });
  }

  if (!createBody.client_id || !validator.isMongoId(createBody.client_id)) {
    errors.push({
      code: 'client_id',
      text: 'El número de identificación del cliente es invalido.',
    });
  }

  return errors.length ? Promise.reject({
    statusCode: 400,
    messages: errors,
    type: 'ValidationError',
  }) : Promise.resolve(createBody);
};

chargeSchema.statics.validateUpdate = (body = {}) => {
  const errors = [];
  const updateBody = mappings.update(body);

  if (!updateBody.amount) {
    errors.push({
      code: 'amount',
      text: 'La cantidad debe ser numerica.',
    });
  }

  if (updateBody.created && moment(updateBody.created, 'DD/MM/YYYY HH:mm').toDate().toString() === 'Invalid Date') {
    errors.push({
      code: 'created',
      text: 'La fecha de creación no es válida.',
    });
  }

  return errors.length ? Promise.reject({
    statusCode: 400,
    messages: errors,
    type: 'ValidationError',
  }) : Promise.resolve(updateBody);
};

chargeSchema.methods.getInfo = function getInfo() {
  return mappings.info(this);
};

chargeSchema.index({
  _id: -1,
});

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
