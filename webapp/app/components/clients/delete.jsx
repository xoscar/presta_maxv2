// dependencies
import React from 'react';

// components
import ClientBase from './base.jsx';
import ModalForm from '../form/modal.jsx';

export default class Delete extends ClientBase {
  constructor() {
    super();
    this.inputs = [{
      field: 'client_id',
      type: 'static',
      value: '',
    }];
  }

  deleteClient() {
    return this.clientService.del(this.props.client.id)

    .then((res) => {
      this.props.onDelete();

      return Promise.resolve(res);
    });
  }

  render() {
    return (
      <ModalForm

      acceptText='Eliminar'

      successText='Cliente eliminado exitosamente'

      header='Confirmacion de seguridad'

      trigger={
        <a className="btn-floating red darken-1"><i className="material-icons">close</i></a>
      }

      closeModal={true}

      inputs={this.inputs}

      onSubmit={this.deleteClient.bind(this)}

      showMessages={false}
      >
        <div className="red-text card col s12 text-darken-3">
          <div className="card-content">
            Estas a punto de eliminar el cliente: <b className="capitalize">{this.props.client.name_complete}</b>, al momento
            de confirmar se borraran todos los prestamos y pagos realizados por este cliente y
            no habrá manera de recuperarlos.
          </div>
        </div>
      </ModalForm>
    );
  }
}

Delete.propTypes = {
  onDelete: React.PropTypes.func.isRequired,
  client: React.PropTypes.object.isRequired,
};
