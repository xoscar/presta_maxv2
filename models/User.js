const mongoose = require('mongoose');
const Async = require('async');
const bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  token: String,
  role: String,
});

userSchema.pre('save', function (next) {
  var _this = this;
  if (_this.isNew) {
    Async.waterfall([
      function encryptPassword(wfaCallback) {
          bcrypt.genSalt(10, function (err, salt) {

            bcrypt.hash(_this.password, salt, null, function (err, hash) {
              _this.password = hash;
              return wfaCallback(err);
            });
          });
      },

      function encryptToken(wfaCallback) {
          bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(_this.token, salt, null, function (err, hash) {
              _this.token = hash;
              return wfaCallback(err);
            });
          });
      },

    ],
      function (err) {
        console.log('saving ended');
        next(err);
      });
  } else next();
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }

    cb(null, isMatch);
  });
};

/**
 * Helper method for validating user's token.
 */
userSchema.methods.compareToken = function (candidateToken, cb) {

  if (this.token === candidateToken)
    return cb(null, true);

  bcrypt.compare(candidateToken, this.token, function (err, isMatch) {
    return cb(err, isMatch);
  });
};

module.exports = mongoose.model('users', userSchema);
