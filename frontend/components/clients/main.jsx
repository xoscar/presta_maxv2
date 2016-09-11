import React from 'react';

import ClientCard from './client_card.jsx';
import ClientHeading from './heading.jsx';
import ClientSearch from './search.jsx';

import ClientActions from '../../actions/client.jsx';

import Pagination from '../pagination/index.jsx';

export default class ClientMain extends React.Component {
  constructor() {
    super();
    this.state = {
      term: '',
      page: 0,
    };
  }

  onSearch(event) {
    event.preventDefault();
    var term = event.target.querySelector('input').value;
    this.sendSearch(term, this.state.page);
  }

  paginationChange(page) {
    console.log(page);
    this.sendSearch(this.state.term, page);
  }

  sendSearch(term, page) {
    var query = [
      {
        name: 's',
        value: term,
      }, {
        name: 'page',
        value: page,
      },
    ];

    this.state.term = term;
    this.state.page = page;
    ClientActions.searchClients(query);
  }

  render() {
    if (!this.props.clients) return null;
    var clients = this.props.clients;

    var cards = clients.map(function (client) {
      return <ClientCard client={client} key={client.id}/>
    });

    return (
      <div>
        <ClientHeading />
        <ClientSearch onSearch = {this.onSearch.bind(this)} />
        <div class="search-wrapper z-depth-1 row animated fadeIn" style={{ paddingTop: '20px' }}>
          <div class="row">
            <div class="col s12 grey-text darken-2">
              <div class="row">
                {cards}
              </div>
            </div>
          </div>
        </div>
        <Pagination onClick={this.paginationChange.bind(this)} results={cards.length}/>
      </div>
    );
  }
}
