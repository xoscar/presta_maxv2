const Charge = require('../models/Charge');

module.exports.create = (req, res) => {
  Charge.create(req.user, req.body, (err, charge) => {
    if (err) res.status(400).send(err);
    else res.json(charge.getInfo());
  });
};

module.exports.pay = (req, res) => {
  req.charge.pay((err) => {
    if (err) res.status(500).send(err);
    else res.send('Success.');
  });
};

module.exports.info = (req, res) => {
  res.json(req.charge.getInfo());
};

module.exports.update = (req, res) => {
  req.charge.update(req.body, (err) => {
    if (err) res.status(500).send(err);
    else res.send('Success.');
  });
};

module.exports.delete = (req, res) => {
  req.charge.remove((err) => {
    if (err) res.status(500).send(err);
    else res.send('Success.');
  });
};
