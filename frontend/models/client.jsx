import RestConnection from '../utils/rest.jsx';
import { queryStringify } from '../utils/common.jsx';

import { logout } from '../utils/auth.jsx';

export default (options = {}) => {
  const restConnection = RestConnection(Object.assign(options, { resource: `${process.env.BASE_URL}/clients`, onfailAuth: logout }));

  restConnection.search = (query = {}) => (
    restConnection.send(`${process.env.BASE_URL}/clients${queryStringify(query)}`, 'GET')
  );

  restConnection.loans = id => (
    restConnection.send(`${process.env.BASE_URL}/clients/${id}/loans`, 'GET')
  );

  return restConnection;
};
