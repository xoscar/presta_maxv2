const mongoose = require('mongoose');
const Async = require('async');
const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');
const select = require('../utils/common').select;

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
      }, ],

      (err) => {
        console.log('saving ended');
        next(err);
      });
  } else next();
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }

    cb(null, isMatch);
  });
};

userSchema.methods.compareToken = function (candidateToken, cb) {

  if (this.token === candidateToken)
    return cb(null, true);

  bcrypt.compare(candidateToken, this.token, function (err, isMatch) {
    return cb(err, isMatch);
  });
};

userSchema.methods.getInfo = function () {
  return {
    username: this.username,
    token: this.token,
    role: this.role,
  };
};

userSchema.statics.validateData = function (query, callback) {
  var errors = [];
  if (!query) errors.push('Emtpy request');

  if (!select(query, 'username') ||
    !validator.isAlphanumeric(query.username) ||
    query.username.length < 4)
    errors.push('Not a valid username.');

  if (!select(query, 'password') ||
    query.password.length < 6)
    errors.push('Not a valid password.');
  if (errors.length === 0)
    this.findOne({ username: query.username }, (err, user) => {
      if (err) callback([err]);
      else if (user) callback(['Username already exists']);
      else {
        var newUser = new this({
          username: query.username,
          password: query.password,
          role: 'user',
        });
        callback(null, newUser);
      }
    });
  else callback(errors);
};

module.exports = mongoose.model('users', userSchema);
