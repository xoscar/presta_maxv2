// models
const User = require('../models/User');

// libs
const signToken = require('../utils/auth').signToken;

// common
const ErrorHandler = require('../utils/errorHandler');

module.exports.login = (req, res) => {
  User.validateLogin(req.body)

    .then(loginBody => (
      User.login(loginBody)

      .then(user => (
        signToken({
          username: user.username,
          timestamp: Date.now(),
          token: user.token,
        })

        .then(userToken => {
          console.log('wut', Object.assign(user.getInfo(), { token: userToken }));
          res.json(Object.assign(user.getInfo(), { token: userToken }));
        })
      ))
    ))

    .catch(ErrorHandler.attach(res));
};

module.exports.info = (req, res) => {
  res.json(req.user.getInfo());
};
