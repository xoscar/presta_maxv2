// depdencencies
import React from 'react';
import { Link } from 'react-router';

// models
import Client from '../../models/client.jsx';

// libs
import { getAuth } from '../../utils/auth.jsx';

// pages
import ClientLoans from './pages/clientLoans.jsx';

export default class ClientBase extends React.Component {
  constructor() {
    super();

    this.clientService = Client({
      headers: getAuth(),
    });
  }
}

export const Card = ({ client, onClosingModal }) => ((
  <div className="col s12 m6 l4">
    <div className="card small hoverable">
      <div className="card-content grey-text text-darken-2">
        <p className="card-title capitalize">{client.client_id}<span className="right complementary-text">{client.name_complete}</span></p>
        <div className="icon-and-text">
          <p><i className="material-icons yellow-text text-darken-2">flash_on</i>Adeudo <span className="right">${client.total_depth}</span></p>
        </div>
        <div className="icon-and-text">
          <p><i className="material-icons blue-text text-darken-2">thumbs_up_down</i>Prestamos <span className="right">{client.loans.length}</span></p>
        </div>
        <div className="icon-and-text">
          <p><i className="material-icons grey-text text-darken-2">access_time</i>Abono <span className="right">{client.last_payment || 'No registrado'}</span></p>
        </div>
        <div className="icon-and-text red-text text-darken-2">
          <p><i className="material-icons">close</i>Vencidos <span className="right">{client.expired_loans ? 'Si' : 'No'}</span></p>
        </div>
        <div className="icon-and-text">
          <p><i className="material-icons green-text text-darken-2">attach_money</i>Cargos <span className="right">{client.charges.length}</span></p>
        </div>
      </div>
      <div className="card-action orange">
        <Link className="white-text" to={`/clients/${client.id}`}>Más</Link>
        { client.active_loans > 0 ? <ClientLoans client={client} onClosingModal={onClosingModal}/> : ''}
      </div>
    </div>
  </div>
));

Card.propTypes = {
  client: React.PropTypes.object.isRequired,
  onClosingModal: React.PropTypes.func.isRequired,
};

export const Information = ({ client }) => ((
  <ul className="collection with-header" style={{ marginTop: '0px' }}>
    <li className="collection-header"><h5>Información</h5></li>
    <li className="collection-item">ID: <span className="secondary-content"> {client.client_id}</span></li>
    <li className="collection-item">Adeudo: <span className="secondary-content">${client.total_depth + '.00'}</span></li>
    <li className="collection-item">Creado: <span className="secondary-content">{client.created}</span></li>
    <li className="collection-item">Prestamos activos: <span className="secondary-content">{client.loans.length}</span></li>
    { client.last_payment ? <li className="collection-item">Ult. pago: <span className="secondary-content">{client.last_payment}</span></li> : ''}

    { client.last_loan ? <li className="collection-item">Ult. prestamo: <span className="secondary-content">{client.last_loan}</span></li> : '' }

    <li className="collection-item">Prestamos vencidos:
      { client.expired_loans ? <span className="secondary-content red-text">Si</span> : <span className="secondary-content">No</span> }
    </li>
  </ul>
));

Information.propTypes = {
  client: React.PropTypes.object.isRequired,
};

