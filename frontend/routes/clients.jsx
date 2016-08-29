import React from 'react';
import Reflux from 'reflux';
import ReactMixin from 'react-mixin';

import ClientActions from '../actions/client.jsx';
import ClientStore from '../stores/client.jsx';

// components
import ClientMain from '../components/clients/main.jsx';
import LoansModal from '../components/loans/loans_modal.jsx';

@ReactMixin.decorate(Reflux.connect(ClientStore, 'clients'))
export default class ClientRoute extends React.Component {
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
    if(this.state.clients && Array.isArray(this.state.clients)) {
      this.clients = this.state.clients;
      return (<div><ClientMain clients={this.clients}/></div>);
    } else if(this.state.clients) {
      this.client = this.state.clients;
      return (<div><ClientMain clients={this.clients}/><LoansModal client={this.client} /></div>);
    } else return (<div><h1>Loading...</h1></div>);
  }
}
