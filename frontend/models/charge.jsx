import RestConnection from '../utils/rest.jsx';
import { logout } from '../utils/auth.jsx';

export default (options) => {
  const restConnection = RestConnection(Object.assign(options, { resource: `${process.env.BASE_URL}/charges`, onfailAuth: logout }));

  restConnection.pay = chargeId => (
    restConnection.send(`${process.env.BASE_URL}/charges/${chargeId}/pay`, 'POST')
  );

  return restConnection;
};
