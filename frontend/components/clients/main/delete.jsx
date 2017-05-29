import React from 'react';

import Response from '../../response/index.jsx';

import Modal from '../../modal/index.jsx';

export default class DeleteClient extends React.Component {
  constructor() {
    super();
    this.state = {
      response: null,
    };
  }

  componentDidUpdate() {
    if (this.state.response && !this.state.response.isError) {
      this.onClosingModal();
      this.props.onDelete();
    }
  }

  deleteClient(event) {
    event.preventDefault();
    this.props.clientService.del(this.props.client.id, (err) => {
      this.setState({
        response: {
          isError: err !== null,
          messages: err || [],
        },
      });
    });
  }

  handleInputChange(key, event) {
    this.setState({
      response: null,
      [key]: event.target.value,
      initial: false,
    });
  }

  onClosingModal() {
    this.props.onClosingModal();
    this.setState({
      response: null,
    });
  }

  render() {
    return (
      <Modal

      id = {'delete_client_modal'}

      show={this.props.show}

      onClosing={this.onClosingModal.bind(this)}

      heading={
        <h5>Confirmacion de seguridad</h5>
      }

      body = {
        <div>
          <div className="center-align">
          { this.state.response ? <Response isError={this.state.response.isError} messages={this.state.response.messages} /> : '' }
          </div>
          <div className="row">
            <div className="red-text card col s12 text-darken-3">
              <div className="card-content">
                Estas a punto de eliminar el cliente: <b className="capitalize">{this.props.client.name_complete}</b>, al momento
                de confirmar se borraran todos los prestamos y pagos realizados por este cliente y
                no habrá manera de recuperarlos.
              </div>
            </div>
          </div>
          <div className="row">
            <form className="col s12" onSubmit={this.deleteClient.bind(this)}>
              <div className="row right-align">
                <div className="input-field col s12">
                  <a className="modal-action modal-close waves-effect waves-green black-text btn grey lighten-3">Cerrar</a>
                  <input type="submit" value="Eliminar" className="btn waves-effect waves-light red white-text darken-2" />
                </div>
              </div>
            </form>
          </div>
        </div>
      }/>
    );
  }
}

DeleteClient.propTypes = {
  onClosingModal: React.PropTypes.func.isRequired,
  client: React.PropTypes.object.isRequired,
  clientService: React.PropTypes.object.isRequired,
  show: React.PropTypes.bool.isRequired,
  onDelete: React.PropTypes.func.isRequired,
};
