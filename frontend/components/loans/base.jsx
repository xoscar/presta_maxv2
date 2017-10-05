// dependencies
import React from 'react';
import { Link } from 'react-router';

// models
import Loan from '../../models/loan.jsx';

// libs
import { getAuth } from '../../utils/auth.jsx';

// components
import NewPayment from '../payments/new.jsx';

export default class LoanBase extends React.Component {
  constructor() {
    super();

    this.loanService = Loan({
      headers: getAuth(),
    });
  }
}

export const LoanSmallCard = ({
  loan,
  onRefresh,
  onContentClick,
}) => ((
  <div className="col s6">
    <div className="card" style={{ height: '191px' }}>
      <div className="card-content white avatar text-darken-2" onClick={onContentClick || (() => {})} style={{ cursor: 'pointer' }}>
        <div className="row" style={{ margin: '0px' }}>
          <div className="col s6">
            { !loan.finished ? <p>Adeudo: ${loan.current_balance + '.00'}</p> : '' }
            <p>Creado: {loan.created_from_now} <span style={{ fontSize: '.7rem' }}>({loan.created})</span></p>
            { loan.finished ? <p>Liquidado: {loan.finished_date}</p> : '' }
          </div>
          <div className="col s6">
            <p>Cantidad: ${loan.amount + '.00'} </p>
            <p>Semanal: ${loan.weekly_payment + '.00'} </p>
            { loan.last_payment ? <p>Abono: {loan.last_payment_from_now} </p> : <p>No se han realizado pagos</p> }
          </div>
        </div>
      </div>
      <div className="card-action">
        <Link to={`/loans/${loan.id}`} className="green-text darken-2">Más</Link>
        { !loan.finished ? <NewPayment fromCard onCreate={onRefresh} loan={loan}/> : '' }
        { loan.expired ? <div className="chip right red white-text">Expirado</div> : '' }
      </div>
    </div>
  </div>
));

LoanSmallCard.propTypes = {
  loan: React.PropTypes.object.isRequired,
  onRefresh: React.PropTypes.func.isRequired,
  onContentClick: React.PropTypes.func,
};

export const Card = ({ loan }) => ((
  <div className="col s12 m4">
    <div className="card client">
      <div className="card-content grey-text text-darken-2">
        <p className="card-title capitalize">${Number(loan.amount).toFixed(2)} <span className="right">{loan.weeks}s</span></p>
        <p>ID: {loan.number_id}.</p>
        <p className="capitalize">Cliente: {loan.client.name_complete}.</p>
        <p>Creado: {loan.created_from_now}.</p>
        {loan.last_payment ? <p>Ultimo abono: {loan.last_payment_from_now}.</p> : ''}
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

Card.propTypes = {
  loan: React.PropTypes.object.isRequired,
};

export const Information = ({ loan }) => ((
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
));

Information.propTypes = {
  loan: React.PropTypes.object.isRequired,
};

