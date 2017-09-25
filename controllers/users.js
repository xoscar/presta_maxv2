// dependencies
const jwt = require('jsonwebtoken');

// models
const User = require('../models/User');

module.exports = {
  postLogin: (req, res) => {
    User.login(req.body, (err, user) => {
      if (err) {
        return res.status(401).json(err);
      }

      return jwt.sign({
        username: user.username,
        timestamp: Date.now(),
        token: user.token,
      }, process.env.SESSION_SECRET, { algorithm: 'HS384' }, (signError, token) => {
        res.json(Object.assign(user.getInfo(), { token }));
      });
    });
  },

  getUserInfo: (req, res) => {
    res.json(req.user.getInfo());
  },
};

// module.exports.getSignUp = (req, res) => {
//   res.redirect('/');
// };

// module.exports.postSignUp = (req, res) => {
//   User.create(req.body, (err, user) => {
//     if (err) res.status(400).json(err);
//     else {
//       user.save(() => {
//         res.json(user.getInfo());
//       });
//     }
//   });
// };

// module.exports.getLogOut = (req, res) => {
//   req.session.destroy(() => {
//     res.redirect('/login');
//   });
// };
