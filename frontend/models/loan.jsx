import RestConnection from '../utils/rest.jsx';
import { queryStringify } from '../utils/common.jsx';
import { logout } from '../utils/auth.jsx';

export default (options = {}) => {
  const restConnection = RestConnection(Object.assign(options, { resource: `${process.env.BASE_URL}/loans`, onfailAuth: logout }));

  restConnection.search = (query = {}) => (
    restConnection.send(`${process.env.BASE_URL}/loans${queryStringify(query)}`, 'GET')
  );

  restConnection.getPayment = (id, paymentId) => (
    restConnection.send(`${process.env.BASE_URL}/loans/${id}/payments/${paymentId}`, 'GET')
  );

  restConnection.createPayment = (id, body) => (
    restConnection.send(`${process.env.BASE_URL}/loans/${id}/payments/`, 'POST', body)
  );

  restConnection.updatePayment = (id, paymentId, body) => (
    restConnection.send(`${process.env.BASE_URL}/loans/${id}/payments/${paymentId}`, 'PATCH', body)
  );

  restConnection.deletePayment = (id, paymentId) => (
    restConnection.send(`${process.env.BASE_URL}/loans/${id}/payments/${paymentId}`, 'DELETE')
  );

  return restConnection;
};
