var RestConnection = require('../utils/rest.js');
var baseUrl = require('../utils/static').baseUrl.client;

function Client(headers) {
  this.resource = baseUrl;
  this.headers = headers;
}

RestConnection.inherits(Client);

Client.prototype.search = function (query, callback) {
  var url = this.attachParamsToUrl(this.resource, query);
  var options = this.generateOptions(url, 'GET', null, callback);
  this.send(options);
};

Client.prototype.loans = function (id, callback) {
  var url = this.resource + '/' + id + '/loans';
  var options = this.generateOptions(url, 'GET', null, callback);
  this.send(options);
};

module.exports = Client;
