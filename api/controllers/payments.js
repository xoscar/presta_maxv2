// dependencies
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');

// common
const ErrorHandler = require('../utils/errorHandler');

const findPayment = (payments, id) => {
  try {
    return Promise.resolve(payments.filter(payment => payment.id === id)[0]);
  } catch (e) {
    return Promise.resolve(null);
  }
};

module.exports.create = (req, res) => {
  Loan.findById(req.params.loanId)
    .then(loan => (
      (loan ? Payment.validateCreate(req.body, loan) : Promise.reject({
        statusCode: 404,
        messages: [{
          code: 'NotFound',
          text: 'Loan not found',
        }],
        type: 'NotFound',
      }))

      .then((createBody) => {
        loan.payments.push(createBody);
        return loan.save();
      })
    ))

    .then(loan => (
      loan.getInfo()

      .then(loanInfo => (
        res.status(201).json(loanInfo)
      ))
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.info = (req, res) => {
  Loan.findById(req.params.loanId)
    .then(loan => (
      (loan ? findPayment(loan.payments, req.params.id) : Promise.reject({
        statusCode: 404,
        messages: [{
          code: 'NotFound',
          text: 'Loan not found',
        }],
        type: 'NotFound',
      }))

      .then(payment => (
        payment ? res.json(payment.getBasicInfo()) : Promise.reject({
          statusCode: 404,
          messages: [{
            code: 'NotFound',
            text: 'Payment not found',
          }],
          type: 'NotFound',
        })
      ))
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.update = (req, res) => {
  Loan.findById(req.params.loanId)

    .then(loan => (
      (loan ? findPayment(loan.payments, req.params.id) : Promise.reject({
        statusCode: 404,
        messages: [{
          code: 'NotFound',
          text: 'Loan not found',
        }],
        type: 'NotFound',
      }))

      .then(payment => (
        (payment ? Payment.validateUpdate(req.body, loan) : Promise.reject({
          statusCode: 404,
          messages: [{
            code: 'NotFound',
            text: 'Payment not found',
          }],
          type: 'NotFound',
        }))

        .then(updatePayment => (
          Object.assign(loan, {
            payments: loan.payments.reduce((acc, current) => (
              acc.concat([current.id === payment.id ? updatePayment : current])
            ), []),
          }).save()
        ))
      ))
    ))

    .then(loan => (
      res.json(loan.getPayments())
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.delete = (req, res) => {
  Loan.findById(req.params.loanId)

    .then(loan => (
      (loan ? findPayment(loan.payments, req.params.id) : Promise.reject({
        statusCode: 404,
        messages: [{
          code: 'NotFound',
          text: 'Loan not found',
        }],
        type: 'NotFound',
      }))

      .then(payment => (
        payment ? Object.assign(loan, {
          payments: loan.payments.reduce((acc, current) => (
            current.id === payment.id ? acc : acc.concat([current])
          ), []),
        }).save() : Promise.reject({
          statusCode: 404,
          messages: [{
            code: 'NotFound',
            text: 'Payment not found',
          }],
          type: 'NotFound',
        })
      ))
    ))

    .then(loan => (
      res.json(loan.getPayments())
    ))

    .catch(ErrorHandler.attach(res));
};
