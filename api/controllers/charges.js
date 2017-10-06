// models
const Charge = require('../models/Charge');

// common
const ErrorHandler = require('../utils/errorHandler');

module.exports.create = (req, res) => {
  Charge.validateCreate(Object.assign(req.body, {
    user_id: req.user.id,
  }))

    .then(createBody => (
      Charge.create(Object.assign(createBody))
    ))

    .then(charge => (
      res.status(201).json(charge.getInfo())
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.pay = (req, res) => {
  Charge.findById(req.params.id)

    .then(charge => (
      charge ? Object.assign(charge, {
        paid: true,
        paid_date: Date.now(),
      }).save() : Promise.reject({
        statusCode: 404,
        messages: [{
          code: 'NotFound',
          text: 'Charge not found',
        }],
        type: 'NotFound',
      })
    ))

    .then(charge => (
      res.json(charge.getInfo())
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.info = (req, res) => {
  Charge.findById(req.params.id)

    .then(charge => (
      charge ? res.json(charge.getInfo()) : Promise.reject({
        statusCode: 404,
        messages: [{
          code: 'NotFound',
          text: 'Charge not found',
        }],
        type: 'NotFound',
      })
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.update = (req, res) => {
  Charge.validateUpdate(req.body)

    .then(updateBody => (
      Charge.findById(req.params.id)

      .then(charge => (
        charge ? Object.assign(charge, updateBody).save() : Promise.reject({
          statusCode: 404,
          messages: [{
            code: 'NotFound',
            text: 'Charge not found',
          }],
          type: 'NotFound',
        })
      ))
    ))

    .then(charge => (
      res.json(charge.getInfo())
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.delete = (req, res) => {
  Charge.findById(req.params.id)

    .then(charge => (
      charge ? Charge.remove({ _id: req.params.id }) : Promise.reject({
        statusCode: 404,
        messages: [{
          code: 'NotFound',
          text: 'Charge not found',
        }],
        type: 'NotFound',
      })
    ))

    .then(() => (
      res.sendStatus(201)
    ))

    .catch(ErrorHandler.attach(res));
};
