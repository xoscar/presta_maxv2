// dependencies
import React from 'react';
import PropTypes from 'prop-types';

// models
import Charge from '../../models/charge.jsx';

// libs
import { getAuth } from '../../utils/auth.jsx';

// components
import ModalForm from '../form/modal.jsx';

export default class Edit extends React.Component {
  constructor(props) {
    super();

    this.chargeService = Charge({
      headers: getAuth(),
    });

    this.inputs = [{
      field: 'amount',
      value: props.charge.amount,
      text: 'Cantidad',
    }, {
      field: 'description',
      value: props.charge.description,
      text: 'Descripcion',
      size: 's12',
    }];
  }

  updateCharge(request) {
    return this.chargeService.update(this.props.charge.id, request)

    .then((charge) => {
      this.props.onEdit();
      return Promise.resolve(charge);
    });
  }

  render() {
    return (
        <ModalForm

        acceptText='Aceptar'

        successText='Cargo modificado exitosamente.'

        header='Modificar cargo'

        trigger={
          <a className="amber-text text-darken-4">Modificar</a>
        }

        inputs={this.inputs}

        onSubmit={this.updateCharge.bind(this)}

        keepForm
        />
    );
  }
}

Edit.propTypes = {
  onEdit: PropTypes.func.isRequired,
  charge: PropTypes.object.isRequired,
};
