import RestConnection from '../utils/rest.jsx';
import { logout } from '../utils/auth.jsx';

export default (options = {}) => {
  const restConnection = RestConnection(Object.assign(options, { resource: `${process.env.BASE_URL}/users`, onfailAuth: logout }));

  restConnection.login = body => (
    restConnection.send(`${process.env.BASE_URL}/users/login`, 'POST', body, false)
  );

  return restConnection;
};
