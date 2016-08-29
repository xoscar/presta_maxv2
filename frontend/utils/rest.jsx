import $ from 'jquery';

export default class RestConnection {
  constructor(options) {
    this.requestsWithBody = 'POST PATCH PUT'.split(' ');
    this.resource = options.resource;
    this.headers = options.headers;
  }

  setOptions(options) {
    this.resource = options.resource || this.resource;
    this.headers = options.headers || this.headers;
  }

  attachParamsToUrl(url, query) {
    if (!query) return null;
    url = url + '?';
    query.forEach(function (param) {
      url += param.name + '=' + param.value + '&';
    });

    return url;
  }

  create(body, callback) {
    var options = this.generateOptions(this.resource, 'POST', body, callback);
    this.send(options);
  }

  update(id, body, callback) {
    var url = this.resource + '/' + id;
    var options = this.generateOptions(url, 'PATCH', body, callback);
    this.send(options);
  }

  get(id, callback) {
    var url = this.resource + '/' + id;
    var options = this.generateOptions(url, 'GET', null, callback);
    this.send(options);
  }

  getAll(callback) {
    var url = this.resource;
    var options = this.generateOptions(url, 'GET', null, callback);
    this.send(options);
  }

  delete(id, callback) {
    var url = this.resource + '/' + id;
    var options = this.generateOptions(url, 'DELETE', null, callback);
    this.send(options);
  }

  extend(methods) {
    methods.forEach((method) => {
      this[method.name] = method.function;
    });
  }

  generateOptions(url, method, body, callback) {
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

    if (this.requestsWithBody.indexOf(method) !== -1)
      options.data = JSON.stringify(body);
    return options;
  }

  getHeaders() {
    var result = {
      'Content-type': 'application/json',
    };

    if (!this.headers) return result;

    var keys = Object.keys(this.headers);
    keys.forEach((key) => result[key] = this.headers[key]);

    return result;
  }

  send(options) {
    $.ajax(options);
  }
}
