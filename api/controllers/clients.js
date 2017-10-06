// models
const Client = require('../models/Client');

// common
const common = require('../utils/common');
const ErrorHandler = require('../utils/errorHandler');

module.exports.search = (req, res) => {
  common.search(Client, Object.assign(req.query, {
    userId: req.user.id,
  }))

    .then(({ results, hits }) => (
      res.json({
        clients: results,
        hits,
      })
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.info = (req, res) => {
  Client.findById(req.params.id)

    .then(client => (
      client ? client.getInfo() : Promise.reject({
        statusCode: 404,
        messages: [{
          code: 'NotFound',
          text: 'Client not found',
        }],
        type: 'NotFound',
      })
    ))

    .then(client => (
      res.json(client)
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.loans = (req, res) => {
  Client.findById(req.params.id)

    .then(client => (
      client ? client.getLoans() : Promise.reject({
        statusCode: 404,
        messages: [{
          code: 'NotFound',
          text: 'Client not found',
        }],
        type: 'NotFound',
      })
    ))

    .then(client => (
      res.json(client)
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.create = (req, res) => {
  Client.validateCreate(Object.assign(req.body, {
    user_id: req.user.id,
  }))

    .then(createBody => (
      Client.getNewId({ userId: req.user.id, body: createBody })

      .then(clientId => (
        Client.create(Object.assign(createBody, {
          client_id: clientId,
        }))
      ))
    ))

    .then(client => (
      client.getInfo()

      .then(info => (
        res.status(201).json(info)
      ))
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.update = (req, res) => {
  Client.validateUpdate(Object.assign(req.body, {
    user_id: req.user.id,
  }))

    .then(updateBody => (
      Client.findById(req.params.id)

      .then(client => (
        client ? Object.assign(client, updateBody).save() : Promise.reject({
          statusCode: 404,
          messages: [{
            code: 'NotFound',
            text: 'Client not found',
          }],
          type: 'NotFound',
        })
      ))
    ))

    .then(client => (
      client.getInfo()

      .then(info => (
        res.json(info)
      ))
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.delete = (req, res) => {
  Client.findById(req.params.id)

  .then(client => (
    client ? client.delete() : Promise.reject({
      statusCode: 404,
      messages: [{
        code: 'NotFound',
        text: 'Client not found',
      }],
      type: 'NotFound',
    })
  ))

  .then(() => (
    res.sendStatus(201)
  ))

  .catch(ErrorHandler.attach(res));
};
