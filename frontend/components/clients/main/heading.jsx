import React from 'react';
import NewClient from './new.jsx';

export default class ClientHeading extends React.Component {
  constructor() {
    super();

    this.state = {
      showClientModal: false,
    };
  }

  onClosingModal() {
    this.setState({
      showClientModal: false,
    });
  }

  render() {
    return (
      <div className="row white z-depth-1">
        <div className="col s12">
          <div style={{ marginTop: '2%' }} className="col s12 red-text text-darken-2">
            <div className="row">
              <h4 className="col s10">Clientes</h4>
              <div className="col s2">
                <button onClick={() => this.setState({ showClientModal: true })} className="add-client right btn waves-effect" style={{ marginTop: '20px' }}>
                  Nuevo
                  <i className="material-icons right">account_box</i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <NewClient show={this.state.showClientModal} onClosingModal={this.onClosingModal.bind(this)} clientService={this.props.clientService} refreshClients={this.props.refreshClients}/>
      </div>
    );
  }
}

ClientHeading.propTypes = {
  clientService: React.PropTypes.object.isRequired,
  refreshClients: React.PropTypes.func.isRequired,
};
