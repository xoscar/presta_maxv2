import React from 'react';

import ClientCard from './client_card.jsx';
import ClientHeading from './heading.jsx';
import ClientSearch from './search.jsx';

import Pagination from '../../pagination/index.jsx';

import Client from '../../../models/client.jsx';

export default class ClientMain extends React.Component {
  constructor() {
    super();

    this.state = {
      term: '',
      page: 0,
      clients: null,
      responses: {
        search: null,
        newClient: null,
      },
    };

    this.clientService = Client({
      headers: {
        user: document.getElementById('user').value,
        token: document.getElementById('token').value,
      },
    });
  }

  componentDidMount() {
    this.sendSearch('', 0);
  }

  paginationChange(page) {
    this.sendSearch(this.state.term, page);
  }

  responseShowed(response) {
    const responses = this.state.responses;
    delete responses[response];

    this.setState({
      responses,
    });
  }

  sendSearch(term, page) {
    const query = [
      {
        name: 's',
        value: term,
      }, {
        name: 'page',
        value: page,
      },
    ];

    this.clientService.search(query, (err, clients) => {
      this.setState({
        term,
        page,
        clients,
        responses: Object.assign(this.state.responses, {
          search: {
            isError: err !== null,
            messages: err || [{
              field: 'success',
              message: '',
            }],
          },
        }),
      });
    });
  }

  render() {
    if (!this.state.clients) {
      return (<h1>Cargando...</h1>);
    }

    const cards = this.state.clients.map(client => (
      <ClientCard client={client} key={client.id}/>
    ));

    return (
      <div>
        <ClientHeading clientService={this.clientService} refreshClients={this.sendSearch.bind(this)}/>
        <ClientSearch onSearch={this.sendSearch.bind(this)} />
        <div className="search-wrapper z-depth-1 row animated fadeIn" style={{ paddingTop: '20px' }}>
          <div className="row">
            <div className="col s12 grey-text darken-2">
              <div className="row">
                {cards}
              </div>
            </div>
          </div>
        </div>
        <Pagination page={this.state.page} onClick={this.paginationChange.bind(this)} results={cards.length}/>
      </div>
    );
  }
}
