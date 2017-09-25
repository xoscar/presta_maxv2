// dependencies
const jwt = require('jsonwebtoken');

// models
const User = require('../models/User');

const authUser = (jwtPayload, callback) => {
  User.findOne({
    username: jwtPayload.username,
  }, (err, user) => {
    if (err || !user) {
      return callback(false);
    }

    return user.compareToken(jwtPayload.token, (compareErr, isMatch) => {
      if (compareErr || !isMatch) {
        return callback(false);
      }

      return callback(true, user);
    });
  });
};

const middleware = (req, res, next) => {
  const token = req.headers.Authorization || req.headers.authorization;

  if (!token) {
    return res.status(401).send({
      type: 'Unauthorized',
      messages: [{
        field: 'Authorization',
        message: 'No token found.',
      }],
    });
  }

  if (!/token [\S]*/.test(token)) {
    return res.status(400).send({
      type: 'Unauthorized',
      messages: [{
        field: 'Authorization',
        message: 'Malformed token.',
      }],
    });
  }

  return jwt.verify(token.split(' ')[1], process.env.SESSION_SECRET, { algorithms: ['HS384'] }, (verifyError, jwtPayload) => {
    if (verifyError) {
      return res.status(401).send({
        type: 'Unauthorized',
        messages: [{
          field: 'Authorization',
          message: 'Not a valid token.',
        }],
      });
    }

    return authUser(jwtPayload, (isAuthed, user) => {
      if (!isAuthed) {
        return res.status(401).send({
          type: 'Unauthorized',
          messages: [{
            field: 'Authorization',
            message: 'Not a valid token.',
          }],
        });
      }

      req.user = user;
      return next();
    });
  });
};

module.exports = {
  authUser,
  middleware,
};
