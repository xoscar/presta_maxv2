const Loan = require('../models/Loan').Loan;
const common = require('../utils/common');
const Async = require('async');

module.exports.search = function (req, res) {
  var userId = req.user.id;
  var searchRequest = req.query.s;
  if (!searchRequest) searchRequest = ' ';

  var page = req.query.p || '0';
  var pageSize = req.query.pSize || '12';

  var finished = req.query.finished || false;

  //get pagination
  var pagination = common.validatePagination(page, pageSize);
  if (!pagination)
    return res.status(400).end('Not a valid request');

  console.log('User ' + userId + ' search for ' + searchRequest);

  // prepare full text search
  var searchTerms = searchRequest.trim().split(' ');

  Loan
    .search(searchTerms, finished, userId, pagination.limit, pagination.skip,
      function (err, docs) {
        if (err) return res.status(500).send('Internal error.');
        Async.map(docs, (loan, mapaCallback) => {
          mapaCallback(null, loan.getInfo());
        }, (err, result) => {
          if (err) return res.status(500).send('Internal error.');
          else res.status(200).json(result);
        });
      });
};

module.exports.info = function (req, res) {
  res.status(200).json(req.loan.getInfo());
};

module.exports.create = function (req, res) {
  Loan.create(req.user, req.body, (err, loan) => {
    if (err) res.status(400).send(err);
    else
      res.status(200).json(loan.getInfo());
  });
};

module.exports.update = function (req, res) {
  req.loan.update(req.body, (err, loan) => {
    if (err) res.status(400).send(err);
    res.json(loan.getInfo());
  });
};

module.exports.delete = function (req, res) {
  req.loan.delete((err) => {
    if (err) res.status(400).send(err);
    else res.send('Success.');
  });
};

module.exports.createPayment = function (req, res) {
  req.loan.createPayment(req.user, req.body, (err, loan) => {
    if (err) res.status(400).send(err);
    else res.json(loan.payments);
  });
};

module.exports.deletePayment = function (req, res) {
  req.loan.deletePayment(req.params, (err, loan) => {
    if (err) res.status(500).send(err);
    else res.json(loan.payments);
  });
};
