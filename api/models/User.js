// dependencies
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');
const uuid = require('uuid-v4');

// common
const common = require('../utils/common');

// schemas
const userSchema = require('../schemas/userSchema');
const mappings = require('../schemas/userSchema').mappings;

userSchema.statics.validateCreate = function validateCreate(body = {}) {
  const errors = [];
  const createBody = mappings.create(body);

  if (!createBody.username || !validator.isAlphanumeric(createBody.username) || createBody.username.length < 4) {
    errors.push({ code: 'username', text: 'Not a valid username.' });
  }

  if (!createBody.password || createBody.password.length < 6) {
    errors.push({ code: 'password', text: 'Not a valid password.' });
  }

  return errors.length ? Promise.reject({
    statusCode: 400,
    messages: errors,
    type: 'ValidationError',
  }) : Promise.resolve(createBody);
};

userSchema.statics.validateLogin = function validateLogin(body = {}) {
  const errors = 'username password'.split(' ').reduce((acc, field) => (
    !body[field] ? acc.concat([{ code: field, text: `El ${field} no puede ser vacío` }]) : acc
  ), []);

  return errors.length ? Promise.reject({
    statusCode: 400,
    messages: errors,
    type: 'ValidationError',
  }) : Promise.resolve(body);
};

userSchema.pre('save', function preSave(next) {
  if (this.isNew) {
    this.role = 'user';
    return Promise

      .all([
        common.encryptString(this.password),
        common.encryptString(uuid()),
      ])

      .then(([password, token]) => {
        this.token = token;
        this.password = password;
        next();
      });
  }

  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return callback(err);
    }

    return callback(null, isMatch);
  });
};

userSchema.statics.validateToken = function validateToken(jwtPayload) {
  return new Promise((resolve, reject) => {
    this.findOne({
      username: jwtPayload.username,
    }, (err, user) => {
      if (err || !user) {
        return reject({
          statusCode: 401,
          code: 'User not found',
        });
      }

      return common.compareToEncryptedString(user.token, jwtPayload.token)

        .then(() => (
          resolve(user)
        ));
    });
  });
};

userSchema.statics.login = function login(query) {
  return new Promise((resolve, reject) => {
    this.findOne({
      username: query.username,
    }, (err, user) => {
      if (err || !user) {
        return reject({
          statusCode: 401,
          messages: [{
            code: 'UserNotFound',
            text: 'User not found',
          }],
          type: 'NotFoundError',
        });
      }

      return common.compareToEncryptedString(user.password, query.password)

        .then(() => (
          resolve(user)
        ));
    });
  });
};

userSchema.methods.getInfo = function getInfo() {
  return mappings.info(this);
};

module.exports = mongoose.model('users', userSchema);
