import Reflux from 'reflux';
import RestConnection from '../utils/rest.jsx';

import loanActions from '../actions/loan.jsx';

var rest = new RestConnection({ resource: 'http://localhost:4000/api/loans' });
rest.extend([{
  name: 'search',
  function: function (query, callback) {
    var url = this.attachParamsToUrl(this.resource, query);
    var options = this.generateOptions(url, 'GET', null, callback);
    this.send(options);
  },
}, {
  name: 'deletePayment',
  function: function (id, paymentId, callback) {
    var url = this.resource + '/' + id + '/payments/' + paymentId;
    var options = this.generateOptions(url, 'DELETE', null, callback);
    this.send(options);
  },
}, {
  name: 'updatePayment',
  function: function (id, paymentId, body, callback) {
    var url = this.resource + '/' + id + '/payments/' + paymentId;
    var options = this.generateOptions(url, 'PATCH', body, callback);
    this.send(options);
  },
}, {
  name: 'getPayment',
  function: function (id, paymentId, callback) {
    var url = this.resource + '/' + id + '/payments/' + paymentId;
    var options = this.generateOptions(url, 'GET', null, callback);
    this.send(options);
  },
}, {
  name: 'createPayment',
  function: function (id, body, callback) {
    var url = this.resource + '/' + id + '/payments/';
    var options = this.generateOptions(url, 'POST', body, callback);
    this.send(options);
  },
}, ]);

var loanStore = Reflux.createStore({
  listenables: [loanActions],
  setAuth: function (user, token) {
    var options = {
      headers: {
        user: user,
        token: token,
      },
    };
    rest.setOptions(options);
  },

  newLoan: function (body) {
    rest.create(body, (err, loan) => {
      this.trigger({
        action: 'new-loan',
        response: {
          message: err ? err : 'Prestamo añadido exitosamente.',
          type: err ? 'error' : 'success',
        },
        payload: loan,
      });
    });
  },

});

export default loanStore;
