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

  searchClients: function (query) {
    rest.search(query, (err, clients) => {
      if (err) this.trigger({
        action: 'error',
      });
      else this.trigger({
        action: 'main',
        payload: clients,
      });
    });
  },

  showNewClient: function () {
    this.trigger({
      action: 'new-client',
    });
  },

  newClient: function (client) {
    rest.create(client, (err, client) => {
      this.trigger({
        action: 'new-client',
        response: {
          message: err ? err : 'Cliente creado exitosamente.',
          type: err ? 'error' : 'success',
        },
        payload: client,
      });
    });
  },

  updateClient: function (id, body) {
    rest.update(id, body, (err, client) => {
      this.trigger({
        action: 'show-client',
        response: {
          message: err ? err : 'Cliente modificado exitosamente.',
          type: err ? 'error' : 'success',
        },
        payload: client,
      });
    });
  },

  getClients: function () {
    rest.getAll((err, clients) => {
      this.trigger({
        action: !err ? 'main' : 'error',
        payload: clients,
      });
    });
  },

  getClient: function (id) {
    rest.get(id, (err, client) => {
      this.trigger({
        action: !err ? 'show-client' : 'error',
        payload: client,
      });
    });
  },

  showLoansModal: function (id) {
    rest.loans(id, (err, client) => {
      this.trigger({
        action: !err ? 'loans-modal' : 'error',
        payload: client,
      });
    });
  },
});

export default clientStore;
