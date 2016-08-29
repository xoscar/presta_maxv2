import Reflux from 'reflux';
import RestConnection from '../utils/rest.jsx';

import clientActions from '../actions/client.jsx';

var rest = new RestConnection({ resource: 'http://localhost:4000/api/clients' });
rest.extend([{
  name: 'search',
  function: function (query, callback) {
    var url = this.attachParamsToUrl(this.resource, query);
    var options = this.generateOptions(url, 'GET', null, callback);
    this.send(options);
  },
}, {
  name: 'loans',
  function: function (id, callback) {
    var url = this.resource + '/' + id + '/loans';
    var options = this.generateOptions(url, 'GET', null, callback);
    this.send(options);
  },
}, ]);

var clientStore = Reflux.createStore({
  listenables: [clientActions],
  setAuth: function (user, token) {
    var options = {
      headers: {
        user: user,
        token: token,
      },
    };
    rest.setOptions(options);
  },

  getClients: function () {
    rest.getAll((err, clients) => {
      if (err) this.trigger(err);
      else this.trigger(clients);
    });
  },

  showLoansModal: function (id) {
    rest.loans(id, (err, client) => {
      if (err) this.trigger(err);
      else this.trigger(client);
    });
  },
});

export default clientStore;
