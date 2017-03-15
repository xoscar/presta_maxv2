import RestConnection from '../utils/rest.jsx';

import loanActions from '../actions/loan.jsx';

const rest = new RestConnection({ resource: 'http://localhost:4000/api/loans' });
rest.extend([{
  name: 'search',
  function: (query, callback) => {
    const url = this.attachParamsToUrl(this.resource, query);
    const options = this.generateOptions(url, 'GET', null, callback);

    this.send(options);
  },
}, {
  name: 'deletePayment',
  function: (id, paymentId, callback) => {
    this.send(this.generateOptions(this.resource + '/' + id + '/payments/' + paymentId, 'DELETE', null, callback));
  },
}, {
  name: 'updatePayment',
  function: (id, paymentId, body, callback) => {
    this.send(this.generateOptions(this.resource + '/' + id + '/payments/' + paymentId, 'PATCH', body, callback));
  },
}, {
  name: 'getPayment',
  function: (id, paymentId, callback) => {
    this.send(this.generateOptions(this.resource + '/' + id + '/payments/' + paymentId, 'GET', null, callback));
  },
}, {
  name: 'createPayment',
  function: (id, body, callback) => {
    this.send(this.generateOptions(this.resource + '/' + id + '/payments/', 'POST', body, callback));
  },
}]);

export default class loanStore extends Reflux.Store {
  constructor() {
    super();
    this.listenables = loanActions;
  }

  setAuth(user, token) {
    rest.setOptions({
      headers: {
        user,
        token,
      },
    });
  }

  newLoan(body) {
    rest.create(body, (err, loan) => {
      this.trigger({
        action: 'new-loan',
        response: {
          message: err || 'Prestamo añadido exitosamente.',
          type: err ? 'error' : 'success',
        },
        payload: loan,
      });
    });
  }
}
