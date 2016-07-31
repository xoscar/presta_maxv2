const User = require('../models/User');

module.exports.getIndex = function (req, res) {
  res.render('portal/main');
};

module.exports.getLogIn = function (req, res) {
  res.render('portal/login');
};

module.exports.postLogIn = function (req, res) {
  res.redirect('/');
};

module.exports.getSignUp = function (req, res) {
  res.redirect('/');
};

module.exports.postSignUp = function (req, res) {
  User.validateData(req.body, (err, user) => {
    if (err && err.length > 0) res.status(400).json(err);
    else
      user.save((err, user) => {
        res.json(user.getInfo());
      });
  });
};
