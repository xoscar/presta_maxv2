const User = require('../models/User');

module.exports.getIndex = function (req, res) {
  if (!req.session.user) res.redirect('/login');
  else res.render('portal/main', { user: req.session.user });
};

module.exports.getLogIn = function (req, res) {
  res.render('portal/login');
};

module.exports.postLogIn = function (req, res) {
  console.log(req.body, req.query);
  User.login(req.body, (err, user) => {
    if (err) {
      req.flash('errors', err.messages);
      return res.redirect('/login');
    } else {
      req.session.user = user;
      res.redirect('/');
    }
  });
};

module.exports.getSignUp = function (req, res) {
  res.redirect('/');
};

module.exports.postSignUp = function (req, res) {
  User.create(req.body, (err, user) => {
    if (err) res.status(400).json(err);
    else
      user.save((err, user) => {
        res.json(user.getInfo());
      });
  });
};

module.exports.getLogOut = function (req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
