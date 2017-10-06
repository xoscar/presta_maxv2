// dependencies
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const validator = require('validator');

const paymentSchema = require('../schemas/paymentSchema');
const mappings = require('../schemas/paymentSchema').mappings;

// Payment Schema

paymentSchema.methods.getBasicInfo = function getBasicInfo(loan) {
  return mappings.info(Object.assign(this, { loan_id: loan.id }));
};

paymentSchema.statics.validateCreate = function validateCreate(body = {}, loan) {
  const errors = [];
  const createBody = mappings.create(body);

  if (!createBody.amount) {
    return Promise.reject({
      statusCode: 400,
      messages: [{ code: 'amount', text: 'La cantidad del pago debe de ser numerica.' }],
      type: 'ValidationError',
    });
  }

  if (loan.getCurrentBalance() - createBody.amount < 0) {
    errors.push({ code: 'payment', text: 'El abono es mayor a la cantidad del saldo del prestamo' });
  }

  if (loan.getCurrentBalance() === 0) {
    errors.push({ code: 'payment', text: 'El prestamo ya fue saldado.' });
  }

  return errors.length ? Promise.reject({
    statusCode: 400,
    messages: errors,
    type: 'ValidationError',
  }) : Promise.resolve(createBody);
};

paymentSchema.statics.validateUpdate = function validateUpdate(body = {}, loan) {
  const errors = [];
  const updateBody = mappings.update(body);

  if (!updateBody.amount) {
    return Promise.reject({
      statusCode: 400,
      messages: [{ code: 'amount', text: 'La cantidad del pago debe de ser numerica.' }],
      type: 'ValidationError',
    });
  }

  if (loan.getCurrentBalance() - updateBody.amount < 0) {
    errors.push({ code: 'payment', text: 'El prestamo ya fue saldado.' });
  }

  if (updateBody.created && moment(updateBody.created, 'DD/MM/YYYY HH:mm').toDate().toString() === 'Invalid Date') {
    errors.push({ code: 'created', text: 'La fecha de creación no es válida.' });
  }

  return errors.length ? Promise.reject({
    statusCode: 400,
    messages: errors,
    type: 'ValidationError',
  }) : Promise.resolve(updateBody);
};

module.exports = mongoose.model('payments', paymentSchema);
