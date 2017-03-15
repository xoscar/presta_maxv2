import React from 'react';

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

    if (this.props.response && !this.props.response.isError && !this.state.initial) {
      this.setState(this.initialState);
    }
  }

  createClient(event) {
    event.preventDefault();
    this.props.onNewClient(this.state);
  }

  handleInputChange(key, event) {
    if (this.props.response) {
      this.props.responseShowed('newClient');
    }

    this.setState({
      [key]: event.target.value,
      initial: false,
    });
  }

  render() {
    return (
      <div>
        <div className="modal add-client-modal">
          <div className="modal-content">
            <div className="col s12">
              <h5>Agregar cliente</h5>
            </div>
            <div className="center-align">
            { this.props.response ? <Response isError={this.props.response.isError} messages={this.props.response.messages} /> : '' }
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
      </div>
    </div>
    );
  }
}

NewClient.propTypes = {
  response: React.PropTypes.object,
  onNewClient: React.PropTypes.func.isRequired,
  responseShowed: React.PropTypes.func.isRequired,
};
