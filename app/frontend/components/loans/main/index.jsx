import React from 'react';

import Card from './card.jsx';
import Heading from './heading.jsx';
import Search from './search.jsx';

import Pagination from '../../pagination/index.jsx';

import Loan from '../../../models/loan.jsx';
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
      },
    };

    this.loanService = Loan({
      headers: {
        user: document.getElementById('user').value,
        token: document.getElementById('token').value,
      },
    });

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

    this.loanService.search(query, (err, loans) => {
      this.setState({
        term,
        page,
        loans,
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
    if (!this.state.loans) {
      return (<h1>Cargando...</h1>);
    }

    return (
      <div>
        <Heading loanService={this.loanService} clientService={this.clientService} onRefresh={this.sendSearch.bind(this, '', 0)}/>
        <Search onSearch={this.sendSearch.bind(this)} />
        <div className="search-wrapper z-depth-1 row animated fadeIn" style={{ paddingTop: '20px' }}>
          <div className="row">
            <div className="col s12 grey-text darken-2">
              <div className="row">
                {
                  this.state.loans.map(loan => (
                    <Card loan={loan} key={loan.id}/>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
        <Pagination page={this.state.page} onClick={this.paginationChange.bind(this)} results={this.state.loans.length}/>
      </div>
    );
  }
}
