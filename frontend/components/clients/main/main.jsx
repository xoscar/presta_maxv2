import React from 'react';

import ClientCard from './client_card.jsx';
import ClientHeading from './heading.jsx';
import ClientSearch from './search.jsx';
import NewClient from './new.jsx';

import Pagination from '../../pagination/index.jsx';

export default class ClientMain extends React.Component {
  constructor() {
    super();

    this.state = {
      term: '',
      page: 0,
      clients: null,
      showNewModal: false,
      responses: {
        search: null,
        newClient: null,
      },
    };
  }

  onSearch(event) {
    event.preventDefault();
    const term = event.target.querySelector('input').value;
    this.sendSearch(term, 0);
  }

  paginationChange(page) {
    this.sendSearch(this.state.term, page);
  }

  componentDidMount() {
    this.sendSearch('', 0);
  }

  componentDidUpdate(pastProps, pastState) {
    if (pastState.showNewModal) {
      $('.add-client-modal').closeModal();

      this.setState({
        showNewModal: false,
      });
    }
  }

  showClientModal(show) {
    this.setState({
      showNewModal: show,
    });
  }

  createNewClient(body) {
    this.props.clientService.create(body, (err) => {
      if (err) {
        return this.setState({
          responses: Object.assign(this.state.responses, {
            newClient: {
              isError: true,
              messages: err,
            },
          }),
        });
      }

      return this.props.clientService.getAll((getAllErr, clients) => {
        this.setState({
          clients,
          responses: Object.assign(this.state.responses, {
            newClient: {
              isError: false,
              messages: [{
                field: 'success',
                message: 'Cliente añadido exitosamente',
              }],
            },
          }),
        });
      });
    });
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

    this.props.clientService.search(query, (err, clients) => {
      console.log(this.state);
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
        <ClientHeading showClientModal={this.showClientModal.bind(this)} />
        <ClientSearch onSearch={this.onSearch.bind(this)} />
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

        { this.state.showNewModal ? <NewClient responseShowed={this.responseShowed.bind(this)} response={this.state.responses.newClient} onNewClient={this.createNewClient.bind(this)}/> : '' }
      </div>
    );
  }
}

ClientMain.propTypes = {
  clientService: React.PropTypes.object.isRequired,
};
