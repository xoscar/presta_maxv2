import React from 'react';

import ClientActions from '../../actions/client.jsx';

export default class ClientCard  extends React.Component {
  constructor() {
    super();
  }

  showModal(event) {
    event.preventDefault();
    ClientActions.showLoansModal(event.target.id);
  }

  render() {
    var client = this.props.client;
    return (
      <div class="col s12 m4">
        <div class="card client">
          <div class="card-content grey-text text-darken-2">
            <span class="card-title capitalize">{client.client_id} </span>
            <p class="capitalize">Nombre: {client.name_complete} {client.surname}.</p>
            <p>Prestamos activos: {client.loans.length}.</p>
            <p>Cargos activos: {client.charges.length}.</p>
            { client.last_payment ? <p>Ultimo abono: {client.last_payment} .</p> : '' }
            <p><b>Adeudo actual: ${client.total_depth}.00.</b></p>
            { client.expired_loans ?
              <p class="red-text text-darken-2">Tiene al menos un prestamo vencido.</p> :
              <p class="green-text text-darken-2">No presenta ningun prestamo vencido.</p>
            }
          </div>
          <div class="card-action">
              <a class="more green-text darken-2">Más</a>
              { client.active_loans > 0 ? <a onClick={this.showModal} id={client.id} class="blue-text darken-2 modal-trigger">Prestamos</a>: ''}
          </div>
        </div>
      </div>
    );
  }
}
