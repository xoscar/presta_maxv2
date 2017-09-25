import RestConnection from '../utils/rest.jsx';

// change this to be ENV configurable.
const resource = 'http://localhost:4000/api/users';

export default (options) => {
  const restConnection = RestConnection(Object.assign(options || {}, { resource }));

  restConnection.login = (body, callback) => (
    restConnection.send(restConnection.generateOptions(`${resource}/login`, 'POST', body, callback))
  );

  return restConnection;
};
