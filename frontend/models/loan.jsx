import RestConnection from '../utils/rest.jsx';

// change this to be ENV configurable.
const resource = 'http://localhost:4000/api/loans';

export default (options) => {
  const restConnection = RestConnection(Object.assign(options || {}, { resource }));

  restConnection.search = (query, callback) => (
    restConnection.send(restConnection.generateOptions(restConnection.attachParamsToUrl(resource, query), 'GET', null, callback))
  );

  restConnection.getPayment = (id, paymentId, callback) => (
    restConnection.send(restConnection.generateOptions(`${resource}/${id}/payments/${paymentId}`, 'GET', null, callback))
  );

  restConnection.createPayment = (id, body, callback) => (
    restConnection.send(restConnection.generateOptions(`${resource}/${id}/payments/`, 'POST', body, callback))
  );

  restConnection.updatePayment = (id, paymentId, body, callback) => (
    restConnection.send(restConnection.generateOptions(`${resource}/${id}/payments/${paymentId}`, 'PATCH', body, callback))
  );

  restConnection.deletePayment = (id, paymentId, callback) => (
    restConnection.send(restConnection.generateOptions(`${resource}/${id}/payments/${paymentId}`, 'DELETE', null, callback))
  );

  return restConnection;
};
