import { Modal } from 'react-materialize';

import React from 'react';
import ChargeComponent from './base.jsx';

export default class ChargePayment extends ChargeComponent {
  payCharge(event) {
    event.preventDefault();

    this.chargeService.pay(this.props.charge.id, (err) => {
      if (!err) {
        this.props.onPaid();
      }
    });
  }

  render() {
    return (
      <Modal

      header='Confirmacion de seguridad'

      trigger={
        <a className="blue-text text-darken-2">Pagar</a>
      }

      actions={
        <div>
          <a className="modal-action modal-close waves-effect waves-green btn-flat">Cerrar</a>
          <a className="modal-action modal-close waves-effect waves-green btn-flat" onClick={this.payCharge.bind(this)}>OK</a>
        </div>
      }>
        <p>Confirmacion pago de cargo.</p>
      </Modal>
    );
  }
}

ChargePayment.propTypes = {
  charge: React.PropTypes.object.isRequired,
  onPaid: React.PropTypes.func.isRequired,
};
