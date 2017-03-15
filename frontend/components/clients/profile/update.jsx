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
    const client = this.props.client;
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
    const state = this.state;

    return (
      <form className="col s8 update_profile_form" onSubmit={this.updateClient.bind(this, state.id)}>
        <div className="row">
          <div className="input-field col s6">
            <input id="first_name" name="name" type="text" className="uppercase validate" value={state.name} onChange={this.onValueChange.bind(this, 'name')} />
            <label className="active" htmlFor="first_name">Nombre</label>
          </div>
          <div className="input-field col s6">
            <input id="last_name" name="surname" type="text" className="uppercase validate" value={state.surname} onChange={this.onValueChange.bind(this, 'surname')} />
            <label className="active" htmlFor="last_name">Apellido</label>
          </div>
          <div className="input-field col s6">
            <input id="phone" name="phone" type="text" className="validate" value={state.phone} onChange={this.onValueChange.bind(this, 'phone')} />
            <label className="active" htmlFor="phone">Teléfono</label>
          </div>
          <div className="input-field col s12">
            <textarea id="address" name="address" className="uppercase materialize-textarea" value={state.address} onChange={this.onValueChange.bind(this, 'address')}></textarea>
            <label className="active" htmlFor="address">Dirección</label>
          </div>
        </div>
        <div className="row">
          <div className="col s12 right-align">
            <button className="waves-effect waves-light btn">Modificar</button>
          </div>
        </div>
      </form>
    );
  }
}

UpdateForm.propTypes = {
  client: React.PropTypes.object.isRequired,
};
