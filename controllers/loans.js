const Loan = require('../models/Loan').Loan;
const Client = require('../models/Client');
const common = require('../utils/common');
const Async = require('async');

module.exports.search = function (req, res) {
  var userId = req.user.id;
  var searchRequest = req.query.s;
  if (!searchRequest) searchRequest = ' ';

  var page = req.query.page || '0';
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
          var info = loan.getBasicInfo();
          Client.findById(info.client_id, (err, client) => {
            info.client = client.getBasicInfo();
            mapaCallback(err, info);
          });
        }, (err, result) => {
          if (err) return res.status(500).send('Internal error.');
          else res.status(200).json(result);
        });
      });
};

module.exports.info = function (req, res) {
  var info = req.loan.getBasicInfo();
  Client.findById(info.client_id, (err, client) => {
    if (err) return res.status(500).send('Processing error');
    info.client = client.getBasicInfo();
    res.status(200).json(info);
  });
};

module.exports.create = function (req, res) {
  if (!req.body.client_id) return res.status(400).send('El id de cliente no es válido.');
  Client.findById(req.body.client_id, (err, client) => {
    if (err) return res.status(500).send('Processing error');
    Loan.create(req.user, client, req.body, (err, loan) => {
      if (err) res.status(400).send(err);
      else {
        var info = loan.getBasicInfo();
        Client.findById(info.client_id, (err, client) => {
          if (err) return res.status(500).send('Processing error');
          info.client = client.getBasicInfo();
          res.status(200).json(info);
        });
      }
    });
  });
};

module.exports.update = function (req, res) {
  req.loan.update(req.body, (err, loan) => {
    if (err) res.status(400).send(err);
    else {
      var info = loan.getBasicInfo();
      Client.findById(info.client_id, (err, client) => {
        if (err) return res.status(500).send('Processing error');
        info.client = client.getBasicInfo();
        res.status(200).json(info);
      });
    }
  });
};

module.exports.delete = function (req, res) {
  req.loan.delete((err) => {
    if (err) res.status(400).send(err);
    else res.send('Success.');
  });
};

module.exports.createPayment = function (req, res) {
  req.loan.createPayment(req.body, (err, loan) => {
    if (err) res.status(400).send(err);
    else res.json(loan.getPayments());
  });
};

module.exports.getPayment = function (req, res) {
  var info = req.loan.getPayment(req.params.paymentId);
  if (!info) return res.status(404).send('Not found');
  else res.json(info);
};

module.exports.updatePayment = function (req, res) {
  req.loan.updatePayment(req.params.paymentId, req.body, (err, loan) => {
    if (err) res.status(400).send(err);
    else res.json(loan.getPayments());
  });
};

module.exports.deletePayment = function (req, res) {
  req.loan.deletePayment(req.params, (err, loan) => {
    if (err) res.status(500).send(err);
    else res.json(loan.getPayments());
  });
};
