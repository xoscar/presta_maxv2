import React from 'react';

export default class ProfileHeading extends React.Component {
  render() {
    return (
      <div className="col s6">
        <div className="card">
          <div className="card-content white avatar text-darken-2 green-text">
            <div className="row" style={{ margin: '0px' }}>
              <div className="col s12">
                <span>Cantidad: ${this.props.charge.amount + '.00'}</span>
                <p>Creado: {this.props.charge.created_from_now} ({this.props.charge.created})</p>
                { !this.props.active ? <p>Pagado: {this.props.charge.paid_date}</p> : '' }
              </div>
            </div>
          </div>
          <div className="card-action">
            { this.props.active ? <a className="pay_charge blue-text text-darken-2">Pagar</a> : '' }
            <a className="update_charge amber-text text-darken-4">Modificar</a>
            <a className="remove_charge red-text text-darken-2">Eliminar</a>
          </div>
        </div>
      </div>
    );
  }
}

ProfileHeading.propTypes = {
  charge: React.PropTypes.object.isRequired,
  active: React.PropTypes.boolean,
};
