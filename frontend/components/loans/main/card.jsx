import React from 'react';
import { Link } from 'react-router';

const card = ({ loan }) => ((
  <div className="col s12 m4">
    <div className="card client">
      <div className="card-content grey-text text-darken-2">
        <p className="card-title capitalize">${Number(loan.amount).toFixed(2)} <span className="right">{loan.weeks}s</span></p>
        <p>ID: {loan.number_id}.</p>
        <p className="capitalize">Cliente: {loan.client.name_complete} {loan.client.surname}.</p>
        <p>Creado: {loan.created_from_now}.</p>
        {loan.ast_payment ? <p>Ultimo abono: {loan.last_payment_from_now}.</p> : ''}
        {loan.current_week ? <p>Semana actual: {loan.current_week}.</p> : '' }
        <p>Pagos realizados: {loan.payments.length}.</p>
        <p><b>Adeudo actual: ${Number(loan.current_balance).toFixed(2)}</b></p>
        <p>Expira en: {loan.expired_date_from_now}</p>
        {loan.expired ? <p className="red-text text-darken-2">Prestamo expirado.</p> : ''}
        { !loan.expired ? <p className="green-text text-darken-2">Prestamo no expirado.</p> : '' }
      </div>
      <div className="card-action">
        <Link to={`/loans/${loan.id}`} className="green-text darken-2">Más</Link>
        <Link to={`/clients/${loan.client.id}`} className="blue-text darken-2">Cliente</Link>
      </div>
    </div>
  </div>
));

card.propTypes = {
  loan: React.PropTypes.object.isRequired,
};

export default card;
