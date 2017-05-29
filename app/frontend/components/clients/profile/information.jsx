import React from 'react';

const information = ({ client }) => ((
  <div className="col s4">
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
  </div>
));

information.propTypes = {
  client: React.PropTypes.object.isRequired,
};

export default information;
