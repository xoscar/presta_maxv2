import React from 'react';
import Reflux from 'reflux';
import ReactMixin from 'react-mixin';

import ClientActions from '../../../actions/client.jsx';
import ClientStore from '../../../stores/client.jsx';

// components
import Main from './main.jsx';
import LoansModal from '../../loans/loans_modal.jsx';
import NewClient from './new.jsx';

@ReactMixin.decorate(Reflux.connect(ClientStore, 'clients'))
export default class ClientsRoute extends React.Component {
  constructor() {
    super();
    this.clients = null;
    this.client = null;
    this.state = {
      user: document.getElementById('user').value,
      token: document.getElementById('token').value,
    };
  }

  componentDidMount() {
    ClientActions.setAuth(this.state.user, this.state.token);
    ClientActions.getClients();
  }

  render() {

    if (!this.state.clients) return (<h1>Cargando...</h1>);

    var action = this.state.clients.action;
    switch(action) {
      case 'main':
        this.clients = this.state.clients.payload;
        return (
          <div>
            <Main clients={this.clients}/>
          </div>
        );
      break;

      case 'new-client':
        this.clients.unshift(this.state.clients.payload);
        return (
          <div>
            <Main clients={this.clients}/>
            <NewClient response={this.state.clients.response}/>
          </div>
        );
      break;

      case 'loans-modal':
        this.client = this.state.clients.payload;
        return (
          <div>
            <Main clients={this.clients}/>
            <LoansModal client={this.client} />
          </div>
        );  
      break;

      default:
        return (<h1>Cargando...</h1>);
      break;
    }
  }
}
