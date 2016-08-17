var RestConnection = require('../utils/rest.js');
var baseUrl = require('../utils/static').baseUrl.loan;

function Loan(headers) {
  this.resource = baseUrl;
  this.headers = headers;
}

RestConnection.inherits(Loan);

Loan.prototype.search = function (query, callback) {
  var url = this.attachParamsToUrl(this.resource, query);
  var options = this.generateOptions(url, 'GET', null, callback);
  this.send(options);
};

Loan.prototype.deletePayment = function (id, paymentId, callback) {
  var url = this.resource + '/' + id + '/payments/' + paymentId;
  var options = this.generateOptions(url, 'DELETE', null, callback);
  this.send(options);
};

Loan.prototype.updatePayment = function (id, paymentId, body, callback) {
  var url = this.resource + '/' + id + '/payments/' + paymentId;
  var options = this.generateOptions(url, 'PATCH', body, callback);
  this.send(options);
};

Loan.prototype.getPayment = function (id, paymentId, callback) {
  var url = this.resource + '/' + id + '/payments/' + paymentId;
  var options = this.generateOptions(url, 'GET', null, callback);
  this.send(options);
};

RestConnection.prototype.createPayment = function (id, body, callback) {
  var url = this.resource + '/' + id + '/payments/';
  var options = this.generateOptions(url, 'POST', body, callback);
  this.send(options);
};

module.exports = Loan;
