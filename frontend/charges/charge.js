var RestConnection = require('../utils/rest.js');

function Charge(headers) {
  this.resource = 'http://localhost:4000/charges';
  this.headers = headers;
}

RestConnection.inherits(Charge);

Charge.prototype.pay = function (id, callback) {
  var url = this.resource + '/' + id + '/pay';
  var options = this.generateOptions(url, 'POST', {}, callback);
  this.send(options);
};

module.exports = Charge;
