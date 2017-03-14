import Reflux from 'reflux';

const clientActions = Reflux.createActions([
  'getClients', 'setAuth', 'getLoans',
  'getClient', 'searchClients', 'newClient',
  'newLoan', 'newCharge', 'removeClient',
  'updateClient', 'showLoansModal', 'showNewClient',
]);

export default clientActions;
