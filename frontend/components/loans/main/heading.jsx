import React from 'react';
import NewLoan from './new.jsx';

export default class ClientHeading extends React.Component {
  constructor() {
    super();

    this.state = {
      showClientModal: false,
      clients: [],
    };
  }

  onClosingModal() {
    this.setState({
      showClientModal: false,
      clients: [],
    });
  }

  onClientSearchChange(event) {
    if (!event.target.value) {
      return this.setState({
        clients: [],
      });
    }

    const query = [{
      name: 's',
      value: event.target.value,
    }, {
      name: 'pSize',
      value: 10,
    }];

    return this.props.clientService.search(query, (err, clients) => {
      if (!err) {
        this.setState({
          clients,
        });
      }
    });
  }

  render() {
    return (
      <div className="row white z-depth-1">
        <div className="col s12">
          <div style={{ marginTop: '2%' }} className="col s12 red-text text-darken-2">
            <div className="row">
              <h4 className="col s10">Prestamos</h4>
              <div className="col s2">
                <button onClick={() => this.setState({ showClientModal: true })} className="add-client right btn waves-effect" style={{ marginTop: '20px' }}>
                  Nuevo
                  <i className="material-icons right">account_box</i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <NewLoan onClientSearch={this.onClientSearchChange.bind(this)} clients={this.state.clients} show={this.state.showClientModal} onClosingModal={this.onClosingModal.bind(this)} loanService={this.props.loanService} onCreate={this.props.onRefresh}/>
      </div>
    );
  }
}

ClientHeading.propTypes = {
  loanService: React.PropTypes.object.isRequired,
  clientService: React.PropTypes.object.isRequired,
  onRefresh: React.PropTypes.func.isRequired,
};
