// dependencies
import React from 'react';

// components
import Pagination from '../../pagination/index.jsx';
import ClientBase, { Card } from '../base.jsx';
import Response from '../../response/index.jsx';
import NewClient from '../new.jsx';
import Heading from '../../heading/heading.jsx';

// fragments
import Search from '../../search/search.jsx';
import Loader from '../../loader/loader.jsx';

export default class ClientHomePage extends ClientBase {
  constructor() {
    super();

    this.state = {
      term: '',
      page: 0,
      clients: null,
      response: null,
    };
  }

  componentDidMount() {
    this.search({ term: '', page: 0 });
  }

  paginationChange(page) {
    this.search({ term: this.state.term, page });
  }

  search({ term, page }) {
    this.clientService.search({ s: term, page })

    .then((result) => {
      const { clients } = result.data;

      this.setState({
        term,
        page,
        clients,
        response: {
          isError: false,
          success: {
            data: {
              messages: [{
                code: 'success',
                text: 'Clientes encontrados.',
              }],
            },
            statusCode: result.statusCode,
          },
        },
      });
    })

    .catch((err) => {
      this.setState({
        response: {
          isError: true,
          err,
        },
      });
    });
  }

  render() {
    return !this.state.clients ? <Loader/> :
    (
      <div>
        <Heading title='Clientes'>
          <NewClient onCreate={this.search.bind(this, { term: '', page: 0 })}/>
        </Heading>
        <div className="container">
          <Search onSearch={this.search.bind(this)} />
          { this.state.response && this.state.response.statusCode >= 400 ? <Response isError={this.state.response.isError} err={this.state.response.err} success={this.state.response.success} /> : '' }
          <div className="row animated fadeIn">
            {this.state.clients.map(client => (
              <Card client={client} onClosingModal={this.search.bind(this, { term: this.state.term, page: this.state.page })} key={client.id}/>
            ))}
          </div>
          <Pagination page={this.state.page} onClick={this.paginationChange.bind(this)} results={this.state.clients.length}/>
        </div>
      </div>
    );
  }
}
