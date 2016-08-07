const Charge = require('../models/Charge');

module.exports.create = function (req, res) {
  Charge.create(req.user, req.body, (err, charge) => {
    if (err) res.status(400).send(err);
    else res.json(charge.getInfo());
  });
};

module.exports.pay = function (req, res) {
  req.charge.pay((err) => {
    if (err) res.status(500).send(err);
    else res.send('Success.');
  });
};

module.exports.delete = function (req, res) {
  req.charge.remove((err) => {
    if (err) res.status(500).send(err);
    else res.send('Success.');
  });
};
