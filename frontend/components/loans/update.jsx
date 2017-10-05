// dependencies
import React from 'react';

// components
import LoanBase from './base.jsx';
import Form from '../form/form.jsx';

export default class UpdateForm extends LoanBase {
  constructor(props) {
    super();

    const loan = props.loan;

    this.inputs = [{
      field: 'client_id',
      value: loan.client_id,
      type: 'static',
    }, {
      field: 'amount',
      value: loan.amount,
      text: 'Cantidad',
    }, {
      field: 'weeks',
      value: loan.weeks,
      text: 'Semanas',
    }, {
      field: 'weekly_payment',
      value: loan.weekly_payment,
      text: 'Pago Semanal',
    }, {
      field: 'created',
      value: loan.created,
      text: 'Creado',
    }, {
      field: 'description',
      value: loan.description,
      text: 'Descripcion',
      size: 's8',
    }];
  }

  updateLoan(request) {
    return this.loanService.update(this.props.loan.id, request)

    .then((updatedLoan) => {
      this.props.onUpdate(updatedLoan.data);
      return Promise.resolve(updatedLoan);
    });
  }

  render() {
    return (
      <Form inputs={this.inputs} showMessages={false} successText='Usuario actualizado' onSubmit={this.updateLoan.bind(this)}>
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
  loan: React.PropTypes.object.isRequired,
  onUpdate: React.PropTypes.func.isRequired,
};
