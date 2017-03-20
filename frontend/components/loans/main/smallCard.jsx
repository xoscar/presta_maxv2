import React from 'react';

const loanSmallCard = ({
  loan,
  active,
}) => ((
  <div className="col s6">
    <div className="card" style={{ height: '169px' }}>
      <div className="card-content white avatar text-darken-2 ">
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
        { loan.expired ? <div className="chip right red white-text"> Expirado </div> : '' }
      </div>
    </div>
  </div>
));

loanSmallCard.propTypes = {
  loan: React.PropTypes.object.isRequired,
  active: React.PropTypes.bool,
};

export default loanSmallCard;
