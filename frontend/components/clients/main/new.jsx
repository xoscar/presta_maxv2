import React from 'react';

import Response from '../../response/index.jsx';

import Modal from '../../modal/index.jsx';

export default class NewClient extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      surname: '',
      phone: '',
      address: '',
      response: null,
      initial: true,
    };

    this.initialState = {
      name: '',
      surname: '',
      phone: '',
      address: '',
      initial: true,
    };
  }

  componentDidUpdate() {
    if (this.state.response && !this.state.response.isError && !this.state.initial) {
      this.setState(this.initialState);
    }
  }

  createNewClient(body) {
    this.props.clientService.create(body, (err) => {
      if (!err) {
        this.props.refreshClients('', 0);
      }

      this.setState({
        response: {
          isError: err !== null,
          messages: err || [{
            field: 'success',
            message: 'Cliente añadido exitosamente.',
          }],
        },
      });
    });
  }

  createClient(event) {
    event.preventDefault();
    this.createNewClient(this.state);
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
    this.setState(Object.assign({}, this.initialState, {
      response: null,
    }));
  }

  render() {
    return (
      <Modal

      id = {'add_client_modal'}

      show={this.props.show}

      onClosing={this.onClosingModal.bind(this)}

      heading={
        <h5>Agregar cliente</h5>
      }

      body = {
        <div>
          <div className="center-align">
          { this.state.response ? <Response isError={this.state.response.isError} messages={this.state.response.messages} /> : '' }
          </div>
          <form className="col s12 add_client_form" onSubmit={this.createClient.bind(this)}>
            <div className="row">
              <div className="input-field col s4">
                <input id="name" value = {this.state.name} onChange = {this.handleInputChange.bind(this, 'name')} type="text" className="uppercase validate" />
                <label htmlFor="name">Nombre</label>
              </div>
              <div className="input-field col s4">
                <input id="surname" value = {this.state.surname} onChange = {this.handleInputChange.bind(this, 'surname')} type="text" className="uppercase validate" />
                <label htmlFor="surname">Apellido</label>
              </div>
              <div className="input-field col s4">
                <input id="phone" type="text" value = {this.state.phone} onChange = {this.handleInputChange.bind(this, 'phone')} className="uppercase validate" />
                <label htmlFor="phone">Teléfono</label>
              </div>
              <div className="input-field col s12">
                <textarea id="address" value={this.state.address} onChange={this.handleInputChange.bind(this, 'address')} className="uppercase materialize-textarea"></textarea>
                <label htmlFor="address">Dirección</label>
              </div>
            </div>
            <div className="row">
              <div className="col s12 right-align">
                <a className="modal-action modal-close waves-effect waves-green black-text btn grey lighten-3">Cerrar</a>
                <button className="waves-effect waves-light btn">Agregar</button>
              </div>
            </div>
          </form>
        </div>
      }/>
    );
  }
}

NewClient.propTypes = {
  refreshClients: React.PropTypes.func.isRequired,
  onClosingModal: React.PropTypes.func.isRequired,
  clientService: React.PropTypes.object.isRequired,
  show: React.PropTypes.bool.isRequired,
};
