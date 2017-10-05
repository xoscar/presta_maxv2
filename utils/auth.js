// dependencies
const jwt = require('jsonwebtoken');

// models
const User = require('../models/User');

const validateToken = (token, username) => {
  const type = 'authError';
  if (!token) {
    return Promise.reject({
      statusCode: 401,
      messages: [{
        code: 'tokenNotFound',
        text: 'No token found.',
      }],
      type,
    });
  }

  if (!/token [\S]*/.test(token)) {
    return Promise.reject({
      statusCode: 400,
      messages: [{
        code: 'malformedToken',
        text: 'Malformed token.',
      }],
      type,
    });
  }

  return new Promise((resolve, reject) => (
    jwt.verify(token.split(' ')[1], process.env.SESSION_SECRET, { algorithms: ['HS384'] }, (verifyError, jwtPayload) => {
      if (verifyError) {
        return reject({
          statusCode: 401,
          messages: [{
            code: 'notValidToken',
            text: 'Not a valid token.',
          }],
          type,
        });
      }

      if (!jwtPayload.username) {
        return reject({
          statusCode: 401,
          messages: [{
            code: 'anonUser',
            text: 'Action requires authenticated user.',
          }],
          type,
        });
      }

      if (username && jwtPayload.username !== username) {
        return reject({
          statusCode: 401,
          messages: [{
            code: 'tokenMismatch',
            text: 'Username doesn\'t match with token.',
          }],
          type,
        });
      }

      return User.validateToken(jwtPayload)

        .then(user => (
          resolve({
            user,
            jwtPayload,
          })
        ));
    })
  ));
};

module.exports.signToken = jwtPayload => (
  new Promise((resolve, reject) => {
    jwt.sign(jwtPayload, process.env.SESSION_SECRET, { algorithm: 'HS384' }, (err, token) => {
      if (err) {
        return reject({
          statusCode: 500,
          messages: [{
            code: 'signingTokenError',
            text: 'Error signing token.',
          }],
          type: 'ProcessingError',
        });
      }

      return resolve(token);
    });
  })
);

module.exports.middleware = (req, res, next) => {
  validateToken(req.headers.Authorization || req.headers.authorization, req.params.username)

    .then((authInfo) => {
      req.user = authInfo.user;
      req.jwtPayload = authInfo.jwtPayload;

      next();
    }, ({
      statusCode,
      messages,
      type,
    }) => (
      res.status(statusCode).json({ messages, type })
    ));
};
