// dependencies
import React from 'react';

// components
import ClientBase from './base.jsx';
import ModalForm from '../form/modal.jsx';

export default class New extends ClientBase {
  constructor() {
    super();

    this.inputs = [{
      field: 'name',
      value: '',
      text: 'Nombre',
    }, {
      field: 'surname',
      value: '',
      text: 'Apellido',
    }, {
      field: 'phone',
      value: '',
      text: 'Telefono',
    }, {
      field: 'address',
      value: '',
      text: 'Dirección',
      size: 's12',
    }];
  }

  createClient(request) {
    return this.clientService.create(request)

    .then((result) => {
      this.props.onCreate();
      return Promise.resolve(result);
    });
  }

  render() {
    return (
        <ModalForm

        acceptText='Agregar'

        successText='Cliente agregado exitosamente.'

        header='Agregar cliente'

        trigger={
          <a className="teal darken-2 btn-large btn-floating waves-effect waves-light"><i className="material-icons">person_add</i></a>
        }

        inputs={this.inputs}

        onSubmit={this.createClient.bind(this)}

        showMessages={false}
        />
    );
  }
}

New.propTypes = {
  onCreate: React.PropTypes.func.isRequired,
};
