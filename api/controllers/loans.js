// dependencies
const Loan = require('../models/Loan');
const Client = require('../models/Client');

// libs
const common = require('../utils/common');

// common
const ErrorHandler = require('../utils/errorHandler');

module.exports.search = (req, res) => {
  common.search(Loan, Object.assign(req.query, {
    userId: req.user.id,
  }), loan => (
    Client.findById(loan.client_id)

    .then(client => (
      loan.getInfo(client)
    ))
  ))

    .then(({ results, hits }) => (
      res.json({
        loans: results,
        hits,
      })
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.info = (req, res) => {
  Loan.findById(req.params.id)

    .then(loan => (
      (loan ? Client.findById(loan.client_id) : Promise.reject({
        statusCode: 404,
        messages: [{
          code: 'NotFound',
          text: 'Loan not found',
        }],
        type: 'NotFound',
      }))

      .then(client => (
        loan.getInfo(client)
      ))
    ))

    .then((loan) => {
      res.json(loan);
    })

    .catch(ErrorHandler.attach(res));
};

module.exports.create = (req, res) => {
  Loan.validateCreate(Object.assign(req.body, {
    userId: req.user.id,
  }))

    .then(createBody => (
      Client.findById(createBody.client_id)

      .then(client => (
        Loan.create(Object.assign(createBody, client ? {
          client_name: `${client.name} ${client.surname}`,
          client_id: client.id,
        } : {}))

        .then(loan => (
          loan.getInfo(client)

          .then((loanInfo) => {
            res.status(201).json(loanInfo);
          })
        ))
      ))
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.update = (req, res) => {
  Loan.validateUpdate(Object.assign(req.body))

    .then(updateBody => (
      Loan.findById(req.params.id)

      .then(loan => (
        (loan ? Client.findById(loan.client_id) : Promise.reject({
          statusCode: 404,
          messages: [{
            code: 'NotFound',
            text: 'Loan not found',
          }],
          type: 'NotFound',
        }))

        .then(client => (
          Object.assign(loan, updateBody, client ? {
            client_name: `${client.name} ${client.surname}`,
            client_id: client.id,
          } : {}).save()

          .then(updatedLoan => (
            updatedLoan.getInfo(client)

            .then(loanInfo => (
              res.status(200).json(loanInfo)
            ))
          ))
        ))
      ))
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.delete = (req, res) => {
  Loan.findById(req.params.id)

    .then(loan => (
      loan.remove()

      .then(() => (
        res.sendStatus(201)
      ))
    ))

    .catch(ErrorHandler.attach(res));
};
