var requestsWithBody = 'POST PATCH PUT'.split(' ');

function RestConnection(options) {
  this.resource = options.resource;
  this.headers = options.headers;
}

RestConnection.prototype.attachParamsToUrl = function (url, query) {
  if (!query) return null;
  url = url + '?';
  query.forEach(function (param) {
    url += param.name + '=' + param.value + '&';
  });

  return url;
};

RestConnection.prototype.create = function (body, callback) {
  var options = this.generateOptions(this.resource, 'POST', body, callback);
  this.send(options);
};

RestConnection.prototype.update = function (id, body, callback) {
  var url = this.resource + '/' + id;
  var options = this.generateOptions(url, 'PATCH', body, callback);
  this.send(options);
};

RestConnection.prototype.get = function (id, callback) {
  var url = this.resource + '/' + id;
  var options = this.generateOptions(url, 'GET', null, callback);
  this.send(options);
};

RestConnection.prototype.getAll = function (callback) {
  var url = this.resource;
  var options = this.generateOptions(url, 'GET', null, callback);
  console.log(options);
  this.send(options);
};

RestConnection.prototype.generateOptions = function (url, method, body, callback) {
  var options = {
    type: method,
    url: url,
    headers: this.getHeaders(),
    cache: false,
    success: function (data, status, xhr) {
      callback(null, data, status, xhr);
    },

    error: function (err) {
      callback(err);
    },
  };

  if (requestsWithBody.indexOf(method) !== -1)
    options.data = JSON.stringify(body);
  return options;
};

RestConnection.prototype.getHeaders = function () {
  var result = {
    'Content-type': 'application/json',
  };

  if (!this.headers) return result;
  this.headers.forEach(function (h) {
    result[h.name] = h.value;
  });

  return result;
};

RestConnection.prototype.send = function (options) {
  $.ajax(options);
};

RestConnection.inherits = function (child) {
  child.prototype = Object.create(this.prototype);
};

module.exports = RestConnection;
