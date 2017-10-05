// dependencies
import React from 'react';

// components
import LoanBase from './base.jsx';
import ModalForm from '../form/modal.jsx';

export default class Delete extends LoanBase {
  constructor() {
    super();
    this.inputs = [];
  }

  deleteLoan() {
    return this.loanService.del(this.props.loan.id)

    .then((res) => {
      this.props.onDelete();

      return Promise.resolve(res);
    });
  }

  render() {
    return (
      <ModalForm

      acceptText='Eliminar'

      successText='Prestamo eliminado exitosamente'

      header='Confirmacion de seguridad'

      trigger={
        <a className="btn-floating red darken-1"><i className="material-icons">close</i></a>
      }

      closeModal={true}

      inputs={this.inputs}

      onSubmit={this.deleteLoan.bind(this)}

      showMessages={false}
      >
        <div className="red-text card col s12 text-darken-3">
          <div className="card-content">
            Estas a punto de elimiar este prestamo, al momento de confirmar se borraran todos los pagos realizados y toda la informacion acerca de deste prestamo.
          </div>
        </div>
      </ModalForm>
    );
  }
}

Delete.propTypes = {
  onDelete: React.PropTypes.func.isRequired,
  loan: React.PropTypes.object.isRequired,
};
