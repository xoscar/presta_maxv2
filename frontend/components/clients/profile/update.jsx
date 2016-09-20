import React from 'react';

import ClientActions from '../../../actions/client.jsx';

export default class UpdateForm extends React.Component {
  constructor() {
    super();
    this.client = null;
    this.state = {
      name: '',
      surname: '',
      phone: '',
      address: '',
    };
  }

  onValueChange(key, event) {
    this.setState({
      [key]: event.target.value,
    });
  }

  componentWillMount() {
    var client = this.props.client;
    this.setState({
      id: client.id,
      name: client.name_complete,
      surname: client.surname,
      phone: client.phone,
      address: client.address,
    });
  }

  updateClient(id, event) {
    event.preventDefault();
    ClientActions.updateClient(id, this.state);
  }

  render() {
    var state = this.state;

    return (
      <form class="col s8 update_profile_form" onSubmit={this.updateClient.bind(this, state.id)}>
        <div class="row">
          <div class="input-field col s6">
            <input id="first_name" name="name" type="text" class="uppercase validate" value={state.name} onChange={this.onValueChange.bind(this, 'name')} />
            <label class="active" for="first_name">Nombre</label>
          </div>
          <div class="input-field col s6">
            <input id="last_name" name="surname" type="text" class="uppercase validate" value={state.surname} onChange={this.onValueChange.bind(this, 'surname')} />
            <label class="active" for="last_name">Apellido</label>
          </div>
          <div class="input-field col s6">
            <input id="phone" name="phone" type="text" class="validate" value={state.phone} onChange={this.onValueChange.bind(this, 'phone')} />
            <label class="active" for="phone">Teléfono</label>
          </div>
          <div class="input-field col s12">
            <textarea id="address" name="address" class="uppercase materialize-textarea" value={state.address} onChange={this.onValueChange.bind(this, 'address')}></textarea>
            <label class="active" for="address">Dirección</label>
          </div>
        </div>
        <div class="row">
          <div class="col s12 right-align">
            <button class="waves-effect waves-light btn">Modificar</button>
          </div>
        </div>
      </form>
    );
  }
}
