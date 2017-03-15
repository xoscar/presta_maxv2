import RestConnection from '../utils/rest.jsx';

// change this to be ENV configurable.
const resource = 'http://localhost:4000/api/clients';

export default (options) => {
  const restConnection = RestConnection(Object.assign(options, { resource }));

  restConnection.search = (query, callback) => (
    restConnection.send(restConnection.generateOptions(restConnection.attachParamsToUrl(resource, query), 'GET', null, callback))
  );

  restConnection.loans = (id, callback) => (
    restConnection.send(restConnection.generateOptions(`${resource}/${id}/loans`, 'GET', null, callback))
  );

  return restConnection;
};
