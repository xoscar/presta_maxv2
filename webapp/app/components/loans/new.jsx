import React from 'react';

// components
import ModalForm from '../form/modal.jsx';
import LoanBase from './base.jsx';

export default class NewLoan extends LoanBase {
  constructor(props) {
    super();

    this.inputs = [
      { field: 'amount', text: 'Cantidad', value: '' },
      { field: 'weekly_payment', text: 'Pago semanal', value: '' },
      { field: 'weeks', text: 'Semanas', value: '' },
      { field: 'description', text: 'Descripción', value: '', size: 's12' },
      { field: 'client_id', value: props.client.id, type: 'static' },
    ];
  }

  createLoan(request) {
    return this.loanService.create(request)

    .then((result) => {
      this.props.onCreate();
      return Promise.resolve(result);
    });
  }

  render() {
    return (
        <ModalForm

        acceptText='Agregar'

        successText='Prestamo agregado exitosamente.'

        header='Añadir prestamo'

        trigger={
          <a className="btn-floating blue darken-1"><i className="material-icons">exposure_plus_1</i></a>
        }

        inputs={this.inputs}

        onSubmit={this.createLoan.bind(this)}

        showMessages={false}
        />
    );
  }
}

NewLoan.propTypes = {
  onCreate: React.PropTypes.func.isRequired,
  client: React.PropTypes.object,
};
