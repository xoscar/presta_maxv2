import React from 'react';

import ChargePayment from './pay.jsx';

export default class Card extends React.Component {
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
            { this.props.active ? <ChargePayment onPaid={this.props.onRefresh} charge={this.props.charge} /> : '' }
            <a className="amber-text text-darken-4">Modificar</a>
            <a className="red-text text-darken-2">Eliminar</a>
          </div>
        </div>
      </div>
    );
  }
}

Card.propTypes = {
  charge: React.PropTypes.object.isRequired,
  onRefresh: React.PropTypes.func,
  active: React.PropTypes.bool,
};
