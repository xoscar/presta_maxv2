var RestConnection = require('../utils/rest.js');

function Charge(headers) {
  this.resource = 'http://localhost:4000/charges';
  this.headers = headers;
}

RestConnection.inherits(Charge);

module.exports = Charge;
