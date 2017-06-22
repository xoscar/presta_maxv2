import $ from 'jquery';

export default (options) => {
  const requestsWithBody = 'POST PATCH PUT'.split(' ');
  const resource = options.resource;
  const headers = options.headers;

  const getHeaders = () => (
    Object.assign({
      'Content-type': 'application/json',
    }, headers || {})
  );

  const send = localOptions => (
    $.ajax(localOptions)
  );

  const attachParamsToUrl = (url, query) => {
    if (!query) {
      return null;
    }

    url += '?';
    query.forEach((param) => {
      url += `${param.name}=${param.value}&`;
    });

    return url;
  };

  const generateOptions = (url, method, body, callback) => {
    const localOptions = {
      type: method,
      url,
      headers: getHeaders(),
      cache: false,
      success: (data, status, xhr) => (
        callback(null, data, status, xhr)
      ),
      error: err => (
        callback(JSON.parse(err.responseText).messages)
      ),
    };

    if (requestsWithBody.indexOf(method) !== -1) {
      localOptions.data = JSON.stringify(body);
    }

    return localOptions;
  };

  const create = (body, callback) => (
    send(generateOptions(resource, 'POST', body, callback))
  );

  const update = (id, body, callback) => (
    send(generateOptions(`${resource}/${id}`, 'PATCH', body, callback))
  );

  const get = (id, callback) => (
    send(generateOptions(`${resource}/${id}`, 'GET', null, callback))
  );

  const getAll = callback => (
    send(generateOptions(resource, 'GET', null, callback))
  );

  const del = (id, callback) => (
    send(generateOptions(`${resource}/${id}`, 'DELETE', null, callback))
  );

  return {
    create,
    get,
    getAll,
    del,
    update,
    send,
    attachParamsToUrl,
    generateOptions,
  };
};
