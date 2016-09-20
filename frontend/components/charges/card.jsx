import React from 'react';

export default class ProfileHeading extends React.Component {
  constructor() {
    super();
  }

  render() {
    var charge = this.props.charge;
    var active = this.props.active;

    return (
      <div class="col s6">
        <div class="card">
          <div class="card-content white avatar text-darken-2 green-text">
            <div class="row" style={{ margin: '0px' }}>
              <div class="col s12">
                <span>Cantidad: ${charge.amount + '.00'}</span>
                <p>Creado: {charge.created_from_now} ({charge.created})</p>
                { !active ? <p>Pagado: {charge.paid_date}</p> : '' }
              </div>
            </div>
          </div>
          <div class="card-action">
            { active ? <a class="pay_charge blue-text text-darken-2">Pagar</a> : '' }
            <a class="update_charge amber-text text-darken-4">Modificar</a>
            <a class="remove_charge red-text text-darken-2">Eliminar</a>
          </div>
        </div>
      </div>
    );
  }
}
