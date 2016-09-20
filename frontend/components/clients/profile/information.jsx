import React from 'react';

export default class Information extends React.Component {
  constructor() {
    super();
  }

  render() {
    var client = this.props.client;

    return (
     <div class="col s4">
        <ul class="collection with-header" style={{ marginTop: '0px' }}>
          <li class="collection-header"><h5>Información</h5></li>
          <li class="collection-item">ID: <span class="secondary-content"> {client.client_id}</span></li>
          <li class="collection-item">Adeudo: <span class="secondary-content">${client.total_depth + '.00'}</span></li>
          <li class="collection-item">Creado: <span class="secondary-content">{client.created}</span></li>
          <li class="collection-item">Prestamos activos: <span class="secondary-content">{client.loans.length}</span></li>
          {
            client.last_payment ? <li class="collection-item">Ult. pago: <span class="secondary-content">{client.last_payment}</span></li> : ''
          }
          {
            client.last_loan ? <li class="collection-item">Ult. prestamo: <span class="secondary-content">{client.last_loan}</span></li> : ''
          }

          <li class="collection-item">Prestamos vencidos: 
            {
              client.expired_loans ?
              <span class="secondary-content red-text">Si</span> :
              <span class="secondary-content">No</span>
            }
          </li>
        </ul>
      </div>
    );
  }
}
