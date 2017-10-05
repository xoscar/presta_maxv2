// dependencies
const mongoose = require('mongoose');
const objectMapper = require('object-mapper');

module.exports = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  token: String,
  role: String,
});

module.exports.mappings = {
  create: body => (
    objectMapper(body, {
      name: 'name',
      username: 'username',
      password: 'password',
    })
  ),
  info: body => (
    objectMapper(body, {
      username: 'username',
      role: 'role',
    })
  ),
};
