import React from 'react';
import { Link } from 'react-router';

/* onClick={this.showModal.bind(this, client.id)} */
const clientCard = ({ client }) => ((
  <div className="col s12 m4">
    <div className="card client">
      <div className="card-content grey-text text-darken-2">
        <span className="card-title capitalize">{client.client_id} </span>
        <p className="capitalize">Nombre: {client.name_complete} {client.surname}.</p>
        <p>Prestamos activos: {client.loans.length}.</p>
        <p>Cargos activos: {client.charges.length}.</p>
        { client.last_payment ? <p>Ultimo abono: {client.last_payment} .</p> : '' }
        <p><b>Adeudo actual: ${client.total_depth}.00.</b></p>
        { client.expired_loans ?
          <p className="red-text text-darken-2">Tiene al menos un prestamo vencido.</p> :
          <p className="green-text text-darken-2">No presenta ningun prestamo vencido.</p>
        }
      </div>
      <div className="card-action">
          <Link to={'/clients/' + client.id} className="more green-text darken-2">Más</Link>
          { client.active_loans > 0 ? <a className="blue-text darken-2 modal-trigger">Prestamos</a> : ''}
      </div>
    </div>
  </div>
));

clientCard.propTypes = {
  client: React.PropTypes.object.isRequired,
};

export default clientCard;
