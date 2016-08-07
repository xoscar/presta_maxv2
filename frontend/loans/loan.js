var RestConnection = require('../utils/rest.js');

function Loan(headers) {
  this.resource = 'http://localhost:4000/loans';
  this.headers = headers;
}

RestConnection.inherits(Loan);

Loan.prototype.search = function (query, callback) {
  var url = this.attachParamsToUrl(this.resource, query);
  var options = this.generateOptions(url, 'GET', null, callback);
  this.send(options);
};

module.exports = Loan;
