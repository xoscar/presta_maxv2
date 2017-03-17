import React from 'react';
import ClassNames from 'classnames';

export default class LoanSmallCard extends React.Component {
  render() {
    const loan = this.props.loan;
    const active = this.props.active;
    const cardContentClass = ClassNames('card-content white avatar text-darken-2', loan.expired ? 'red-text' : 'green-text');

    return (
      <div className="col s6">
        <div className="card" style={{ height: '169px' }}>
          <div className={cardContentClass}>
            <div className="row" style={{ margin: '0px' }}>
              <div className="col s6">
                { active ? <p>Adeudo: ${loan.current_balance + '.00'}</p> : '' }
                <p>Creado: {loan.created_from_now} <span style={{ fontSize: '.7rem' }}>({loan.created})</span></p>
                { !active ? <p>Liquidado: {loan.finished_date}</p> : '' }
              </div>
              <div className="col s6">
                <p>Cantidad: ${loan.amount + '.00'} </p>
                <p>Semanal: ${loan.weekly_payment + '.00'} </p>
                { loan.last_payment ? <p>Abono: {loan.last_payment_from_now} </p> : <p>No se han realizado pagos</p> }
              </div>
            </div>
          </div>
          <div className="card-action">
            <a className="green-text text-darken-2">Más</a>
            { active ? <a className="blue-text text-darken-2">Abonar</a> : '' }
          </div>
        </div>
      </div>
    );
  }
}

LoanSmallCard.propTypes = {
  loan: React.PropTypes.object.isRequired,
  active: React.PropTypes.boolean,
};