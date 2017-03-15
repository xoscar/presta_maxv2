import React from 'react';

// components
import Main from './main.jsx';
// import LoansModal from '../../loans/loans_modal.jsx';

import Client from '../../../models/client.jsx';

export default class ClientsRoute extends React.Component {
  constructor() {
    super();

    this.clientService = Client({
      headers: {
        user: document.getElementById('user').value,
        token: document.getElementById('token').value,
      },
    });
  }

  render() {
    return (
      <div>
        <Main clientService={this.clientService}/>
      </div>
    );
  }
}

