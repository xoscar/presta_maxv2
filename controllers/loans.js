'use strict';

const Loan = require('../models/Loan').Loan;
const Client = require('../models/Client');
const common = require('../utils/common');
const Async = require('async');

module.exports.search = (req, res) => {
  const userId = req.user.id;
  let searchRequest = req.query.s;
  if (!searchRequest) searchRequest = ' ';

  const page = req.query.page || '0';
  const pageSize = req.query.pSize || '12';

  const finished = req.query.finished || false;

  // get pagination
  const pagination = common.validatePagination(page, pageSize);
  if (!pagination) {
    return res.status(400).end('Not a valid request');
  }

  console.log('User ' + userId + ' search for ' + searchRequest);

  // prepare full text search
  const searchTerms = searchRequest.trim().split(' ');

  return Loan.search(searchTerms, finished, userId, pagination.limit, pagination.skip, (err, docs) => {
    if (err) {
      return res.status(500).send('Internal error.');
    }

    return Async.map(docs, (loan, mapaCallback) => {
      const info = loan.getBasicInfo();
      Client.findById(info.client_id, (findErr, client) => {
        info.client = client.getBasicInfo();
        mapaCallback(findErr, info);
      });
    }, (mapErr, result) => {
      if (mapErr) return res.status(500).send('Internal error.');

      return res.status(200).json(result);
    });
  });
};

module.exports.info = (req, res) => {
  const info = req.loan.getBasicInfo();

  Client.findById(info.client_id, (err, client) => {
    if (err) {
      return res.status(500).send('Processing error');
    }

    info.client = client.getBasicInfo();
    return res.status(200).json(info);
  });
};

module.exports.create = (req, res) => {
  if (!req.body.client_id) {
    return res.status(400).send('El id de cliente no es válido.');
  }

  return Client.findById(req.body.client_id, (err, client) => {
    if (err) {
      return res.status(500).send('Processing error');
    }

    return Loan.create(req.user, client, req.body, (createErr, loan) => {
      if (createErr) {
        console.log('ERROR', createErr);
        return res.status(400).send(createErr);
      }

      console.log('wtf');

      const info = loan.getBasicInfo();
      info.client = client.getBasicInfo();
      console.log('wtf');
      return res.status(200).json(info);
    });
  });
};

module.exports.update = (req, res) => {
  req.loan.update(req.body, (err, loan) => {
    if (err) res.status(400).send(err);
    else {
      const info = loan.getBasicInfo();
      Client.findById(info.client_id, (findErr, client) => {
        if (findErr) {
          return res.status(500).send('Processing error');
        }

        info.client = client.getBasicInfo();
        return res.status(200).json(info);
      });
    }
  });
};

module.exports.delete = (req, res) => {
  req.loan.delete((err) => {
    if (err) res.status(400).send(err);
    else res.send('Success.');
  });
};

module.exports.createPayment = (req, res) => {
  req.loan.createPayment(req.body, (err, loan) => {
    if (err) res.status(400).send(err);
    else res.json(loan.getPayments());
  });
};

module.exports.getPayment = (req, res) => {
  const info = req.loan.getPayment(req.params.paymentId);
  if (!info) return res.status(404).send('Not found');

  return res.json(info);
};

module.exports.updatePayment = (req, res) => {
  req.loan.updatePayment(req.params.paymentId, req.body, (err, loan) => {
    if (err) res.status(400).send(err);
    else res.json(loan.getPayments());
  });
};

module.exports.deletePayment = (req, res) => {
  req.loan.deletePayment(req.params, (err, loan) => {
    if (err) res.status(500).send(err);
    else res.json(loan.getPayments());
  });
};
