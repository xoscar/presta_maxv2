'use strict';

const Client = require('../models/Client');
const common = require('../utils/common');
const Async = require('async');

module.exports.search = (req, res) => {
  const userId = req.user.id;
  let searchRequest = req.query.s;

  if (!searchRequest) searchRequest = ' ';

  const page = req.query.page || '0';
  const pageSize = req.query.pSize || '12';

  // get pagination
  const pagination = common.validatePagination(page, pageSize);
  if (!pagination) {
    return res.status(400).end('Not a valid request');
  }

  console.log('User ' + userId + ' search for ' + searchRequest);

  // prepare full text search
  const searchTerms = searchRequest.trim().split(' ');

  return Client.search(searchTerms, userId, pagination.limit, pagination.skip, (err, docs) => {
    if (err) {
      return res.status(500).send('Internal error.');
    }

    return Async.map(docs, (client, mapaCallback) => {
      client.getInfo(mapaCallback);
    }, (mapErr, result) => {
      if (mapErr) {
        return res.status(500).send('Internal error.');
      }

      return res.status(200).json(result);
    });
  });
};

module.exports.info = (req, res) => {
  req.client.getInfo((err, info) => {
    if (err) res.status(400).send('Error getting information.');
    else res.json(info);
  });
};

module.exports.loans = (req, res) => {
  req.client.getInfo((err, info) => {
    if (err) res.status(400).send('Error getting information.');
    else res.json(info);
  });
};

module.exports.create = (req, res) => {
  Client.create(req.user, req.body, (err, client) => {
    if (err) {
      res.status(400).send(err);
    } else {
      client.getInfo((infoErr, info) => {
        if (infoErr) res.status(500).send('Error creating client.');
        else res.json(info);
      });
    }
  });
};

module.exports.update = (req, res) => {
  req.client.update(req.body, (err, client) => {
    if (err) {
      res.status(400).send(err);
    } else {
      client.getInfo((infoErr, info) => {
        if (err) res.status(500).send('Error updating client.');
        else res.json(info);
      });
    }
  });
};

module.exports.delete = (req, res) => {
  req.client.delete((err) => {
    if (err) res.status(500).send(err);
    else res.send('Success.');
  });
};
