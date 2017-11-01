const mongoose = require('mongoose');
const common = require('../utils/common');
const moment = require('moment-timezone');

// models
const Loan = require('./Loan');
const Charge = require('./Charge');

// schema
const clientSchema = require('../schemas/clientSchema');
const mappings = require('../schemas/clientSchema').mappings;

clientSchema.statics.validateCreate = function validateCreate(body = {}) {
  const createBody = mappings.create(body);

  const errors = 'name surname address phone user_id'.split(' ').reduce((acc, field) => (!createBody[field] ? acc.concat([{
    code: field,
    text: `${field} ingresado no es válido.`,
  }]) : acc), []);

  return errors.length ? Promise.reject({
    statusCode: 400,
    messages: errors,
    type: 'ValidationError',
  }) : Promise.resolve(createBody);
};

clientSchema.statics.validateUpdate = function validateUpdate(body = {}) {
  const updateBody = mappings.update(body);

  const errors = 'name surname address phone'.split(' ').reduce((acc, field) => (!updateBody[field] ? acc.concat([{
    code: field,
    text: `${field} ingresado no es válido.`,
  }]) : acc), []);

  return errors.length ? Promise.reject({
    statusCode: 400,
    messages: errors,
    type: 'ValidationError',
  }) : Promise.resolve(updateBody);
};

clientSchema.statics.getNewId = function getNewId({ userId, body = {} }) {
  const clientId = `${body.name.slice(0, 2).toUpperCase()}${body.surname.slice(0, 2).toUpperCase()}`;

  return this.find({
    client_id: { $regex: new RegExp(clientId + '[0-9]') },
    user_id: userId,
  }).select('client_id').exec()

  .then(clients => (
    Promise.resolve(`${clientId}${clients.length}`)
  ));
};

clientSchema.pre('save', function preSave(next) {
  const searchFields = 'name client_id surname'.split(' ');
  this.search = common.generateArrayFromObject(this, searchFields);
  this.updated = Date.now();

  next();
});

clientSchema.methods.getBasicInfo = function getBasicInfo() {
  return mappings.info(this);
};

clientSchema.methods.getInfo = function getInfo() {
  return Promise.all([
    this.getLoans({ finished: false })

    .then(({ loans, metadata }) => (
      Promise.resolve({
        loans,
        active_loans: loans.length !== 0,
        loans_depth: metadata.loans_depth,
        last_payment: metadata.last_payment ? metadata.last_payment.format('DD/MM/YYYY HH:mm') : null,
        last_payment_from_now: metadata.last_payment ? metadata.last_payment.fromNow() : null,
        last_loan: metadata.last_loan ? metadata.last_loan.format('DD/MM/YYYY HH:mm') : null,
        last_loan_from_now: metadata.last_loan ? metadata.last_loan.fromNow() : null,
        expired_loans: metadata.expired,
      })
    )),

    this.getLoans({ finished: true })

    .then(({ loans }) => (
      Promise.resolve({
        finished_loans: loans,
      })
    )),

    this.getCharges({ finished: false })

    .then(({ charges, total_depth }) => (
      Promise.resolve({
        charges,
        charges_depth: total_depth,
      })
    )),

    this.getCharges({ finished: true })

    .then(({ charges }) => (
      Promise.resolve({
        paid_charges: charges,
      })
    )),
  ])

  .then(([activeLoans, finishedLoans, activeCharges, finishedCharges ]) => (
    Promise.resolve(Object.assign(mappings.info(this), activeLoans, finishedLoans, activeCharges, finishedCharges, {
      total_depth: (activeLoans.loans_depth || 0) + (activeCharges.charges_depth || 0),
    }))
  ));
};

clientSchema.methods.getCharges = function getCharges({ finished }) {
  return Charge
    .find({
      client_id: this.id,
      paid: finished,
    })
    .sort({ created: -1 })
    .exec()

    .then(charges => (
      Promise.resolve({
        charges: charges.map(charge => charge.getInfo()),
        total_depth: charges.reduce((acc, charge) => (
          acc + charge.amount
        ), 0),
      })
    ));
};

clientSchema.methods.getLoans = function getLoans(params) {
  return Loan
    .find(params ? {
      client_id: this.id,
      finished: params.finished,
    } : {
      client_id: this.id,
    })
    .sort({ created: -1 })
    .exec()

    .then(loans => (
      Promise.resolve({
        loans: loans.map(loan => loan.getBasicInfo()),
        metadata: {
          expired: Boolean(loans.filter(loan => loan.expired)[0]),
          last_payment: loans.reduce((acc, loan) => {
            const loanBasicInfo = loan.getBasicInfo();
            return loanBasicInfo.last_payment && moment(loanBasicInfo.last_payment).isAfter(moment(acc || moment().subtract(4, 'year').toDate())) ? moment(loanBasicInfo.last_payment) : null;
          }, null),
          last_loan: loans.length ? moment(loans[loans.length - 1].getBasicInfo().created, 'DD/MM/YYYY HH:mm') : null,
          loans_depth: loans.reduce((acc, loan) => acc + loan.getBasicInfo().current_balance, 0),
        },
      })
    ));
};

clientSchema.methods.delete = function deleteClient() {
  return Loan.find({ client_id: this.id })

  .remove()
  .exec()

  .then(() => (
    this.remove()
  ));
};

clientSchema.index({
  _id: 1,
});

clientSchema.index({
  created: -1,
});

clientSchema.index({
  created: -1,
  user_id: 1,
});

clientSchema.index({
  search: 1,
});

module.exports = mongoose.model('clients', clientSchema);
