import React from 'react';
import Reflux from 'reflux';
import ReactMixin from 'react-mixin';

import ClientActions from '../../../actions/client.jsx';
import ClientStore from '../../../stores/client.jsx';

// components
import ClientProfile from './client.jsx';
import NewLoan from '../../loans/new.jsx';
import NewCharge from '../../charges/new.jsx';

@ReactMixin.decorate(Reflux.connect(ClientStore, 'clients'))
export default class ClientRoute extends React.Component {
	constructor() {
		super();
		this.client = null;
		this.state = {
			user: document.getElementById('user').value,
      token: document.getElementById('token').value,
      showNewLoan: false,
      showNewCharge: false,
		};
	}

  onAction(type, event) {
    event.preventDefault();
    switch (type) {
      case 'remove':
        ClientActions.removeClient(this.client.id);
      break;

      case 'show_add_loan':
        this.setState({
          showNewLoan: !this.state.showNewLoan,
        });
      break;

      case 'show_add_charge':
        this.setState({
          showNewCharge: !this.state.showNewCharge,
        });
      break;
    }
  }

	componentDidMount() {
		ClientActions.setAuth(this.state.user, this.state.token);
		if (this.props.params && this.props.params.clientId) {
			this.state.clientId = this.props.params.clientId;
    	ClientActions.getClient(this.props.params.clientId);
		}
	}

	render() {
		if(!this.state.clients && !this.client) return (<h1>Cargando...</h1>);

		var action = this.state.clients.action;
		switch(action) {
			case 'show-client':
				this.client = this.state.clients.payload || this.client;
				return (
					<div>
						<ClientProfile client={this.client} onAction={ this.onAction.bind(this) } response = {this.state.clients.response}/>
						{ this.state.showNewLoan ? <NewLoan client={client} /> : '' }
        		{ this.state.showNewCharge ? <NewCharge client={client} /> : '' }
					</div>
				);
			break;

			default:
				return (<h1>Cargando...</h1>);
			break;
		}
	}
}