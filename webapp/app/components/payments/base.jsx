// dependencies
import React from 'react';
import PropTypes from 'prop-types';
import ModalForm from '../form/modal.jsx';

// models
import Loan from '../../models/loan.jsx';

// libs
import { getAuth } from '../../utils/auth.jsx';

export default class PaymentBase extends React.Component {
  constructor() {
    super();

    this.loanService = Loan({
      headers: getAuth(),
    });
  }
}

export class EditPayment extends PaymentBase {
  constructor(props) {
    super();

    this.inputs = [{
      field: 'amount',
      text: 'Cantidad',
      value: props.payment.amount,
    }, {
      field: 'created',
      text: 'Creado',
      value: props.payment.created,
    }];
  }

  updatePayment(request) {
    return this.loanService.updatePayment(this.props.loan.id, this.props.payment.id, request)

    .then((result) => {
      this.props.onEdit();
      return Promise.resolve(result);
    });
  }

  render() {
    return (
        <ModalForm

        acceptText='Modificar'

        successText='Pago modificado exitosamente.'

        header='Modificar Pago'

        trigger={
          <a className="yellow-text text-darken-2"><i className="material-icons">edit</i></a>
        }

        closeModal={true}

        inputs={this.inputs}

        onSubmit={this.updatePayment.bind(this)}

        showMessages={false}
        />
    );
  }
}

EditPayment.propTypes = {
  onEdit: React.PropTypes.func.isRequired,
  loan: React.PropTypes.object.isRequired,
  payment: React.PropTypes.object.isRequired,
};

export const PaymentCard = ({
  onRefresh,
  loan,
  payment,
  number,
}) => {
  const deletePayment = (event) => {
    event.preventDefault();

    Loan({
      headers: getAuth(),
    }).deletePayment(loan.id, payment.id)

    .then(() => (
      onRefresh()
    ));
  };

  return (
    <div className="col s4">
      <div className="card">
        <div className="card-content white avatar text-darken-2">
          <p className="card-title">{`#${number}`} <span className="right">${Number(payment.amount).toFixed(2)}</span></p>
          <p className="capitalize">{payment.created_from_now} <span style={{ fontSize: '.7rem' }}>({payment.created})</span></p>
        </div>
        <div className="card-action">
          <a className="red-text text-darken-2" onClick={deletePayment.bind(this)}><i className="material-icons">close</i></a>
          <EditPayment loan={loan} payment={payment} onEdit={onRefresh} />
        </div>
      </div>
    </div>
  );
};

PaymentCard.propTypes = {
  payment: PropTypes.object.isRequired,
  loan: PropTypes.object.isRequired,
  number: PropTypes.number.isRequired,
  onRefresh: PropTypes.func.isRequired,
};
