import React from 'react';

// components
import ModalForm from '../form/modal.jsx';
import PaymentBase from './base.jsx';

export default class NewPayment extends PaymentBase {
  constructor(props) {
    super();

    this.inputs = [{
      field: 'amount',
      value: props.loan.weekly_payment,
      text: 'Cantidad',
      size: 's6 offset-s3',
    }];
  }

  createPayment(request) {
    return this.loanService.createPayment(this.props.loan.id, request)

    .then((result) => {
      this.props.onCreate();
      return Promise.resolve(result);
    });
  }

  render() {
    return (
        <ModalForm

        acceptText='Agregar'

        successText='Pago agregado exitosamente.'

        header='Nuevo Pago'

        trigger={
          this.props.fromCard ? <a className="blue-text text-darken-2">Abonar</a> : <a className="btn-floating blue darken-1"><i className="material-icons">exposure_plus_1</i></a>
        }

        inputs={this.inputs}

        onSubmit={this.createPayment.bind(this)}
        />
    );
  }
}

NewPayment.propTypes = {
  onCreate: React.PropTypes.func.isRequired,
  loan: React.PropTypes.object.isRequired,
  fromCard: React.PropTypes.bool,
};
