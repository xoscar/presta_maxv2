import React from 'react';

import ClientActions from '../../../actions/client.jsx';
import Response from '../../response/index.jsx';

export default class NewClient extends React.Component {
  constructor() {
    super();
    this.state = {
      name: '',
      surname: '',
      phone: '',
      address: '',
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

  componentDidMount() {
    $('.add-client-modal').openModal();
  }

  componentDidUpdate() {
    $('.add-client-modal').openModal();

    if (this.props.response &&
      this.props.response.type === 'success' &&
      !this.state.initial) {
      this.setState(this.initialState);
      ClientActions.getClients();
    }
  }

  createClient(event) {
    event.preventDefault();
    ClientActions.newClient(this.state);
  }

  handleInputChange(key, event) {
    this.setState({
      [key]: event.target.value,
      initial: false,
    });
  }

  render() {
    return (
      <div>
        <div class="modal add-client-modal">
          <div class="modal-content">
            <div class="col s12">
              <h5>Agregar cliente</h5>
            </div>
            <div class="center-align">
              <Response response = {this.props.response} />
            </div>
            <form class="col s12 add_client_form" onSubmit = {this.createClient.bind(this)}>
              <div class="row">
                <div class="input-field col s4">
                  <input id="name" value = {this.state.name} onChange = {this.handleInputChange.bind(this, 'name')} type="text" class="uppercase validate" />
                  <label for="name">Nombre</label>
                </div>
                <div class="input-field col s4">
                  <input id="surname" value = {this.state.surname} onChange = {this.handleInputChange.bind(this, 'surname')} type="text" class="uppercase validate" />
                  <label for="surname">Apellido</label>
                </div>
                <div class="input-field col s4">
                  <input id="phone" type="text" value = {this.state.phone} onChange = {this.handleInputChange.bind(this, 'phone')} class="uppercase validate" />
                  <label for="phone">Teléfono</label>
                </div>
                <div class="input-field col s12">
                  <textarea id="address" value = {this.state.address} onChange = {this.handleInputChange.bind(this, 'address')} class="uppercase materialize-textarea"></textarea>
                  <label for="address">Dirección</label>
                </div>
              </div>
              <div class="row">
                <div class="col s12 right-align">
                  <a class="modal-action modal-close waves-effect waves-green black-text btn grey lighten-3">Cerrar</a>
                  <button class="waves-effect waves-light btn">Agregar</button>
                </div>
              </div>
            </form>
          </div>
      </div>
    </div>
    );
  }
}
