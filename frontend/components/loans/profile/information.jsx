import React from 'react';

const information = ({ loan }) => ((
  <div className="col s4">
    <ul className="collection with-header" style={{ marginTop: '0px' }}>
      <li className="collection-header"><h5>Información</h5></li>
      <li className="collection-item">
        <div>ID: <span className="secondary-content">{loan.number_id}</span></div>
      </li>
      <li className="collection-item">
        <div>Saldo: <span className="secondary-content">${Number(loan.current_balance).toFixed(2)}</span></div>
      </li>
      { loan.last_payment ? <li className="collection-item"><div>Ult. abono: <span className="secondary-content">{loan.last_payment_from_now}</span></div></li> : ''}
      { loan.finish ? <li className="collection-item"><div>Terminado: <span className="secondary-content">Si</span></div></li> : ''}

      <li className="collection-item"><div>Abonos: <span className="secondary-content">{loan.payments.length}</span></div></li>

      {loan.current_week ? <li className="collection-item"><div>Semana actual: <span className="secondary-content">{loan.current_week}</span></div></li> : '' }

      <li className="collection-item"><div>Vencimiento: <span className="secondary-content">{loan.expired_date}</span></div></li>

      <li className="collection-item">
        <div> Vencido: { loan.expired ? <span className="secondary-content red-text">Si </span> : <span className="secondary-content">No </span> } </div>
      </li>
    </ul>
  </div>
));

information.propTypes = {
  loan: React.PropTypes.object.isRequired,
};

export default information;
