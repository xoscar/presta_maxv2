module.exports.getIndex = function (req, res) {
  res.render('portal/main');
};

module.exports.getLogIn = function (req, res) {
  res.render('portal/login');
};

module.exports.postLogIn = function (req, res) {
  res.redirect('/');
};
