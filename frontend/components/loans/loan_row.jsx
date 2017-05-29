import React from 'react';
import ClassNames from 'classnames';

export default class LoanRow extends React.Component {
  render() {
    const loan = this.props.loan;
    const contentClass = ClassNames(loan.expired_class, loan.text_color, 'card-content white avatar text-darken-2');
    const loanClass = ClassNames(loan.selected, 'card loan');

    if (!loan) {
      return null;
    }

    return (
      <div>
        <a id={loan.id} onClick={ this.props.onClick }>
          <div className={loanClass} >
            <div className={contentClass}>
              <div className="row" style={{ margin: '0px' }}>
              <div className="col s6">
                <p>Adeudo: ${loan.current_balance}.00</p>
                <p>
                  Creado {loan.created_from_now} <span style={{ fontSize: '.7rem' }}>({loan.created})</span>
                </p>
              </div>
              <div className="col s6">
                <p>Cantidad: ${loan.amount}.00 </p>
                <p>Semanal: ${loan.weekly_payment}.00 </p>
                {loan.last_payment ? <p>Abono: {loan.last_payment_from_now} </p> : <p>No se han realizado pagos</p>}
              </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }
}

LoanRow.propTypes = {
  loan: React.PropTypes.object.isRequired,
  onClick: React.PropTypes.func.isRequired,
};
