// dependencies
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const validator = require('validator');

// models
const Counter = require('./Counter');

// common
const common = require('../utils/common');

// schemas
const loanSchema = require('../schemas/loanSchema');
const mappings = require('../schemas/loanSchema').mappings;

const paymentMappings = require('../schemas/paymentSchema').mappings;

loanSchema.statics.validateCreate = function validateCreate(body = {}) {
  const createBody = mappings.create(body);
  const errors = 'amount weekly_payment weeks'.split(' ').reduce((acc, field) => (
    !createBody[field] ? acc.concat([{ code: field, text: `El ${field} no es valido` }]) : acc
  ), []);


  if (!createBody.client_id || !validator.isMongoId(createBody.client_id)) {
    errors.push({ code: 'client_id', text: 'El número de identificación del cliente es invalido.' });
  }

  if (createBody.created && moment(createBody.created, 'DD/MM/YYYY HH:mm').toDate().toString() === 'Invalid Date') {
    errors.push({ code: 'created', text: 'La fecha de creación no es válida.' });
  }

  if (!errors.length) {
    if (+createBody.weeks < 0 && +createBody.weeks > 60) {
      errors.push({ code: 'weeks', text: 'El número de semanas debe ser entre 1 y 60' });
    }

    if (+createBody.amount <= createBody.weeks) {
      errors.push({ code: 'amount', text: 'El número de semanas debe de ser menor al de la cantidad total del prestamo.' });
    }

    if (+createBody.amount <= +createBody.weekly_payment) {
      errors.push({ code: 'amount', text: 'El pago semanal debe de ser menor a la cantidad total del prestamo.' });
    }
  }

  return errors.length ? Promise.reject({
    statusCode: 400,
    messages: errors,
    type: 'ValidationError',
  }) : Promise.resolve(createBody);
};

loanSchema.statics.validateUpdate = function validateUpdate(body = {}) {
  const updateBody = mappings.update(body);
  const errors = 'amount weekly_payment weeks'.split(' ').reduce((acc, field) => (
    !updateBody[field] ? acc.concat([{ code: field, text: `El ${field} no es valido` }]) : acc
  ), []);


  if (!updateBody.client_id || !validator.isMongoId(updateBody.client_id)) {
    errors.push({ code: 'client_id', text: 'El número de identificación del cliente es invalido.' });
  }

  if (updateBody.created && moment(updateBody.created, 'DD/MM/YYYY HH:mm').toDate().toString() === 'Invalid Date') {
    errors.push({ code: 'created', text: 'La fecha de creación no es válida.' });
  }

  if (!errors.length) {
    if (+updateBody.weeks < 0 && +updateBody.weeks > 60) {
      errors.push({ code: 'weeks', text: 'El número de semanas debe ser entre 1 y 60' });
    }

    if (+updateBody.amount <= updateBody.weeks) {
      errors.push({ code: 'amount', text: 'El número de semanas debe de ser menor al de la cantidad total del prestamo.' });
    }

    if (+updateBody.amount <= +updateBody.weekly_payment) {
      errors.push({ code: 'amount', text: 'El pago semanal debe de ser menor a la cantidad total del prestamo.' });
    }
  }

  return errors.length ? Promise.reject({
    statusCode: 400,
    messages: errors,
    type: 'ValidationError',
  }) : Promise.resolve(updateBody);
};

loanSchema.pre('save', function preSave(next) {
  const searchFields = 'amount weeks client_id _id client_identifier client_name number_id'.split(' ');

  this.search = common.generateArrayFromObject(this, searchFields);
  this.expired_date = moment(this.created)
    .endOf('week')
    .add(this.weeks, 'weeks')
    .endOf('week')
    .toDate();

  this.updated = Date.now();
  this.finished = this.getCurrentBalance() === 0 ? this.finished = true : this.finished = false;
  this.finished_date = this.finished && !this.finished_date ? moment().toDate() : null;

  return this.isNew ? Counter.findOne({ name: 'loans' })

  .then(counter => (
    counter.getNext()

    .then((value) => {
      this.number_id = value;
      this.search.push(this.number_id.toString());

      next();
    })
  )) : next();
});

loanSchema.methods.isExpired = function isExpired() {
  return moment().isAfter(this.expired_date) && !this.finished;
};

loanSchema.methods.getCurrentWeek = function getCurrentWeek() {
  return moment().diff(this.created, 'weeks') > this.weeks + 1 ? null : moment().diff(this.created, 'weeks') + 1;
};

loanSchema.methods.getPayments = function getPayments() {
  return this.payments.sort((a, b) => (
    moment(b.created).isAfter(a.created) ? 1 : 0
  )).map(payment => (
    paymentMappings.info(Object.assign(payment, { loan_id: this.id }))
  ));
};

loanSchema.methods.getBasicInfo = function getBasicInfo() {
  return mappings.info(this);
};

loanSchema.methods.getInfo = function getInfo(client) {
  return Promise.resolve(Object.assign(mappings.info(this), {
    client: client ? client.getBasicInfo() : {},
  }));
};

loanSchema.methods.getLastPayment = function getLastPayment() {
  return this.payments.length !== 0 ? this.payments.sort((a, b) => (
    moment(a.created).isAfter(b.created) ? 1 : -1
  ))[0] : null;
};

loanSchema.methods.getCurrentBalance = function getCurrentBalance() {
  return this.amount - this.payments.reduce((acc, payment) => (
    +acc + +payment.amount
  ), 0);
};

loanSchema.index({
  _id: 1,
});

loanSchema.index({
  created: -1,
});

loanSchema.index({
  client_id: -1,
});

loanSchema.index({
  created: -1,
  user_id: 1,
});

loanSchema.index({
  search: 1,
});

module.exports = mongoose.model('loans', loanSchema);
