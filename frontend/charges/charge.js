var RestConnection = require('../utils/rest');
var baseUrl = require('../utils/static').baseUrl.charge;

function Charge(headers) {
  this.resource = baseUrl;
  this.headers = headers;
}

RestConnection.inherits(Charge);

Charge.prototype.pay = function (id, callback) {
  var url = this.resource + '/' + id + '/pay';
  var options = this.generateOptions(url, 'POST', {}, callback);
  this.send(options);
};

module.exports = Charge;
