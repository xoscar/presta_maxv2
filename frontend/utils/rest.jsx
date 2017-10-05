import $ from 'jquery';

export default ({ resource = '', headers = {}, onfailAuth = null }) => {
  const send = (url, method, body, redirect = true) => (
    new Promise((resolve, reject) => {
      $.ajax({
        type: method,
        url,
        headers: Object.assign({
          'Content-type': 'application/json',
        }, headers),
        cache: false,
        success: (data, res, xhr) => {
          resolve({
            data,
            statusCode: xhr.status,
          });
        },
        error: (err) => {
          try {
            if (err.status === 401 && onfailAuth && redirect) {
              onfailAuth(url);
            } else {
              reject({
                data: JSON.parse(err.responseText),
                statusCode: err.status,
              });
            }
          } catch (e) {
            console.log('Undlandled error', e);
            reject({
              data: {
                messages: [{
                  code: 'Unhandled error.',
                  text: 'Error while connecting to API services',
                }],
              },
              statusCode: 500,
            });
          }
        },
        data: 'POST PATCH PUT'.split(' ').indexOf(method) !== -1 && JSON.stringify(body),
      });
    })
  );

  const create = body => (
    send(resource, 'POST', body)
  );

  const update = (id, body) => (
    send(`${resource}/${id}`, 'PATCH', body)
  );

  const get = id => (
    send(`${resource}/${id}`, 'GET')
  );

  const getAll = () => (
    send(resource, 'GET')
  );

  const del = id => (
    send(`${resource}/${id}`, 'DELETE')
  );

  return {
    create,
    get,
    getAll,
    del,
    update,
    send,
  };
};
