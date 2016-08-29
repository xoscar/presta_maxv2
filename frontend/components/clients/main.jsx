import React from 'react';

import ClientCard from './client_card.jsx';

import ClientActions from '../../actions/client.jsx';

export default class ClientMain extends React.Component {
  constructor() {
    super();
  }

  render() {
    if (!this.props.clients) return null;
    var clients = this.props.clients;

    var cards = clients.map(function (client) {
      return <ClientCard client={client} key={client.id}/>
    });

    return (
      <div class="row">
        <div class="col s12 grey-text darken-2">
          <div class="row">
            {cards}
          </div>
        </div>
      </div>
    );
  }
}
