// dependencies
import React from 'react';
import PropTypes from 'prop-types';

// components
import ChargeBase from './base.jsx';
import ModalForm from '../form/modal.jsx';

export default class New extends ChargeBase {
  constructor(props) {
    super();

    this.inputs = [{
      field: 'amount',
      value: '',
      text: 'Cantidad',
    }, {
      field: 'description',
      value: '',
      text: 'Descripcion',
      size: 's12',
    }, {
      field: 'client_id',
      value: props.client.id,
      type: 'static',
    }];
  }

  createCharge(request) {
    return this.chargeService.create(request)

    .then((charge) => {
      this.props.onCreate();
      return Promise.resolve(charge);
    });
  }

  render() {
    return (
        <ModalForm

        acceptText='Aceptar'

        successText='Cargo agregado exitosamente.'

        header='Nuevo cargo'

        trigger={
          <a className="btn-floating add_charge amber darken-4"><i className="material-icons">attach_money</i></a>
        }

        inputs={this.inputs}

        onSubmit={this.createCharge.bind(this)}
        />
    );
  }
}

New.propTypes = {
  onCreate: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
};
