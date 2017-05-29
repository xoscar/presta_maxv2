import RestConnection from '../utils/rest.jsx';

// change this to be ENV configurable.
const resource = 'http://localhost:4000/api/charges';

export default options => (
  RestConnection(Object.assign(options, { resource }))
);
