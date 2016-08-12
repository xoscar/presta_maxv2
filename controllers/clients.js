const Client = require('../models/Client');
const common = require('../utils/common');
const Async = require('async');

module.exports.search = function (req, res) {
  var userId = req.user.id;
  var searchRequest = req.query.s;
  if (!searchRequest) searchRequest = ' ';

  var page = req.query.page || '0';
  var pageSize = req.query.pSize || '12';

  //get pagination
  var pagination = common.validatePagination(page, pageSize);
  if (!pagination)
    return res.status(400).end('Not a valid request');

  console.log('User ' + userId + ' search for ' + searchRequest);

  // prepare full text search
  var searchTerms = searchRequest.trim().split(' ');

  Client
    .search(searchTerms, userId, pagination.limit, pagination.skip,
      function (err, docs) {
        if (err) return res.status(500).send('Internal error.');
        Async.map(docs, (client, mapaCallback) => {
          client.getInfo(mapaCallback);
        }, (err, result) => {
          if (err) return res.status(500).send('Internal error.');
          else res.status(200).json(result);
        });
      });
};

module.exports.info = function (req, res) {
  req.client.getInfo((err, info) => {
    if (err) res.status(400).send('Error getting information.');
    else res.json(info);
  });
};

module.exports.loans = function (req, res) {
  req.client.getInfo((err, info) => {
    if (err) res.status(400).send('Error getting information.');
    else res.json(info);
  });
};

module.exports.create = function (req, res) {
  Client.create(req.user, req.body, (err, client) => {
    if (err) res.status(400).send(err);
    else client.getInfo((err, info) => {
      if (err) res.status(500).send('Error creating client.');
      else res.json(info);
    });
  });
};

module.exports.update = function (req, res) {
  req.client.update(req.body, (err, client) => {
    if (err) res.status(400).send(err);
    else client.getInfo((err, info) => {
      if (err) res.status(500).send('Error updating client.');
      else res.json(info);
    });
  });
};

module.exports.delete = function (req, res) {
  req.client.delete((err) => {
    if (err) res.status(500).send(err);
    else res.send('Success.');
  });
};
