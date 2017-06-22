const mongoose = require('mongoose');
const Async = require('async');
const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');
const select = require('../utils/common').select;
const Response = require('../utils/response');

function validateData(query) {
  const errors = new Response('error');

  if (!query) {
    errors.push('request', 'Emtpy request');
  }

  if (!select(query, 'username') ||
    !validator.isAlphanumeric(query.username) ||
    query.username.length < 4) {
    errors.push('username', 'Not a valid username.');
  }

  if (!select(query, 'password') ||
    query.password.length < 6) {
    errors.push('password', 'Not a valid password.');
  }

  return errors;
}

function validateLogIn(query) {
  const errors = new Response('error');

  if (Object.keys(query) === 0) {
    errors.push('request', 'Emtpy request');
  }

  if (!select(query, 'username')) {
    errors.push('username', 'El usuario no puede estar vacío.');
  }

  if (!select(query, 'password')) {
    errors.push('password', 'La contraseña no puede estar vacía.');
  }

  return errors;
}

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  token: String,
  role: String,
});

userSchema.pre('save', function preSave(next) {
  if (this.isNew) {
    Async.waterfall([
      (wfaCallback) => {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(this.password, salt, null, (hashErr, hash) => {
            this.password = hash;
            return wfaCallback(hashErr);
          });
        });
      },

      (wfaCallback) => {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(this.token, salt, null, (hashErr, hash) => {
            this.token = hash;
            return wfaCallback(hashErr);
          });
        });
      }],

      (err) => {
        console.log('saving ended');
        next(err);
      });
  }

  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return callback(err);
    }

    return callback(null, isMatch);
  });
};

userSchema.methods.compareToken = function compareToken(candidateToken, callback) {
  if (this.token === candidateToken) {
    return callback(null, true);
  }

  return bcrypt.compare(candidateToken, this.token, (err, isMatch) => (
    callback(err, isMatch)
  ));
};

userSchema.methods.getInfo = function getInfo() {
  return {
    username: this.username,
    token: this.token,
    role: this.role,
  };
};

userSchema.statics.login = function login(query, callback) {
  const errors = validateLogIn(query);

  if (errors.messages.length === 0) {
    this.findOne({
      username: query.username,
    }, (err, user) => {
      if (err || !user) {
        errors.push('missmatch', 'Error en el usuario o la contraseña.');

        return callback(errors);
      }


      return user.comparePassword(query.password, (compareErr, isMatch) => {
        if (compareErr || !isMatch) {
          errors.push('missmatch', 'Error en el usuario o la contraseña.');
          return callback(errors);
        }

        return callback(null, user);
      });
    });
  } else {
    callback(errors);
  }
};

userSchema.statics.create = function create(query, callback) {
  const errors = validateData(query);

  if (errors.messages.length === 0) {
    this.findOne({ username: query.username }, (err, user) => {
      if (err) {
        errors.push('application', err);
        callback(errors);
      } else if (user) {
        errors.push('username', 'User already exists');
        callback(errors);
      } else {
        const newUser = new this({
          username: query.username,
          password: query.password,
          role: 'user',
        });

        callback(null, newUser);
      }
    });
  } else {
    callback(errors);
  }
};

module.exports = mongoose.model('users', userSchema);
