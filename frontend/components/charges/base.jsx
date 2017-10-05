// depedencies
import React from 'react';

// models
import Charge from '../../models/charge.jsx';

// libs
import { getAuth } from '../../utils/auth.jsx';

// components
import UpdateCharge from './update.jsx';
import ModalForm from '../form/modal.jsx';

export default class ChargeBase extends React.Component {
  constructor() {
    super();

    this.chargeService = Charge({
      headers: getAuth(),
    });

    this.state = {
      response: null,
      initial: true,
    };

    this.initialState = {
      initial: true,
      response: null,
    };
  }

  componentDidUpdate() {
    if (this.state.response && !this.state.response.isError && !this.state.initial) {
      this.setState(this.initialState);
    }
  }

  handleInputChange(key, event) {
    this.setState({
      response: null,
      [key]: event.target.value,
      initial: false,
    });
  }
}

export class Payment extends ChargeBase {
  payCharge() {
    return this.chargeService.pay(this.props.charge.id)

    .then((result) => {
      this.props.onPaid();
      return Promise.resolve(result);
    });
  }

  render() {
    return (
      <ModalForm

      acceptText='Pagar'

      successText='Cargo liquidado exitosamente'

      header='Confirmacion de seguridad'

      trigger={
        <a className="blue-text text-darken-2">Pagar</a>
      }

      closeModal={true}

      inputs={[]}

      onSubmit={this.payCharge.bind(this)}
      >
        <div className="red-text card col s12 text-darken-3">
          <div className="card-content">
            Confirmación de pago de cargo.
          </div>
        </div>
      </ModalForm>
    );
  }
}

Payment.propTypes = {
  charge: React.PropTypes.object.isRequired,
  onPaid: React.PropTypes.func.isRequired,
};

export class Delete extends ChargeBase {
  deleteCharge() {
    return this.chargeService.del(this.props.charge.id)

    .then((result) => {
      this.props.onDelete();
      return Promise.resolve(result);
    });
  }

  render() {
    return (
      <ModalForm

      acceptText='Eliminar'

      successText='Cargo eliminado exitosamente'

      header='Confirmacion de seguridad'

      trigger={
        <a className="red-text text-darken-2">Eliminar</a>
      }

      closeModal={true}

      inputs={[]}

      onSubmit={this.deleteCharge.bind(this)}
      >
        <div className="red-text card col s12 text-darken-3">
          <div className="card-content">
            Confirmación para eliminar cargo.
          </div>
        </div>
      </ModalForm>
    );
  }
}

Delete.propTypes = {
  charge: React.PropTypes.object.isRequired,
  onDelete: React.PropTypes.func.isRequired,
};

export const ChargeCard = ({
  charge,
  onRefresh,
}) => ((
  <div className="col s6">
    <div className="card">
      <div className="card-content white avatar text-darken-2 green-text">
        <div className="row" style={{ margin: '0px' }}>
          <div className="col s12">
            <span>Cantidad: ${charge.amount + '.00'}</span>
            <p>Creado: {charge.created_from_now} ({charge.created})</p>
            { charge.paid ? <p>Pagado: {charge.paid_date}</p> : '' }
          </div>
        </div>
      </div>
      <div className="card-action">
        { !charge.paid ? <Payment onPaid={onRefresh} charge={charge} /> : '' }
        <UpdateCharge charge={charge} onEdit={onRefresh}/>
        <Delete charge={charge} onDelete={onRefresh}/>
      </div>
    </div>
  </div>
));

ChargeCard.propTypes = {
  charge: React.PropTypes.object.isRequired,
  onRefresh: React.PropTypes.func,
};

