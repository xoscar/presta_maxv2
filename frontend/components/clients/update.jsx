// dependencies
import React from 'react';

// components
import ClientBase from './base.jsx';
import Form from '../form/form.jsx';

export default class UpdateForm extends ClientBase {
  constructor(props) {
    super();

    const client = props.client;

    this.inputs = [{
      field: 'user_id',
      value: client.user_id,
      type: 'static',
    }, {
      field: 'name',
      value: client.name,
      text: 'Nombre',
    }, {
      field: 'surname',
      value: client.surname,
      text: 'Apellido',
    }, {
      field: 'phone',
      value: client.phone,
      text: 'Telefono',
    }, {
      field: 'address',
      value: client.address,
      text: 'Dirección',
      size: 's12',
    }];
  }

  updateClient(request) {
    return this.clientService.update(this.props.client.id, request)

    .then((updatedClient) => {
      this.props.onUpdate(updatedClient.data);
      return Promise.resolve(updatedClient);
    });
  }

  render() {
    return (
      <Form inputs={this.inputs} showMessages={false} successText='Usuario actualizado' onSubmit={this.updateClient.bind(this)}>
        <div className="row">
          <div className="col s12 right-align">
            <button className="waves-effect waves-green btn-flat">Modificar</button>
          </div>
        </div>
      </Form>
    );
  }
}

UpdateForm.propTypes = {
  client: React.PropTypes.object.isRequired,
  onUpdate: React.PropTypes.func.isRequired,
};
