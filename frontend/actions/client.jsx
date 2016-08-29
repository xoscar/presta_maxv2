import Reflux from 'reflux';

var clientActions = Reflux.createActions([
  'getClients', 'setAuth', 'getLoans',
  'getClient', 'searchClients', 'newClient',
  'newLoan', 'newCharge', 'removeClient',
  'updateClient', 'showLoansModal',
]);

export default clientActions;
