const User = require('../models/User');

module.exports.getIndex = (req, res) => {
  if (!req.session.user) res.redirect('/login');
  else res.render('portal/main', { user: req.session.user });
};

module.exports.getLogIn = (req, res) => {
  res.render('portal/login');
};

module.exports.postLogIn = (req, res) => {
  console.log(req.body, req.query);
  User.login(req.body, (loginErr, user) => {
    if (loginErr) {
      req.flash('errors', loginErr.messages);
      return res.redirect('/login');
    }

    req.session.user = user;
    return res.redirect('/');
  });
};

module.exports.getSignUp = (req, res) => {
  res.redirect('/');
};

module.exports.postSignUp = (req, res) => {
  User.create(req.body, (err, user) => {
    if (err) res.status(400).json(err);
    else {
      user.save(() => {
        res.json(user.getInfo());
      });
    }
  });
};

module.exports.getLogOut = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
