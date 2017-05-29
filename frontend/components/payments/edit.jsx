import React from 'react';

// components
import Response from '../response/index.jsx';
import Modal from '../modal/index.jsx';

export default class EditPayment extends React.Component {
  constructor() {
    super();

    this.state = {
      amount: '',
      created: '',
      initial: true,
    };

    this.initialState = {
      amount: '',
      created: '',
      initial: true,
    };
  }

  componentDidUpdate() {
    if (this.state.initial && this.props.payment) {
      this.setState({
        amount: this.props.payment.amount,
        created: this.props.payment.created,
        initial: false,
      });
    }
  }

  createPayment(event) {
    event.preventDefault();

    return this.props.loanService.updatePayment(this.props.loan.id, this.props.payment.id, this.state, (err) => {
      if (!err) {
        this.props.onEdit();
      }

      this.setState({
        response: {
          isError: err !== null,
          messages: err || [{
            field: 'success',
            message: `Abono añadido exitosamente a ${this.props.loan.client.name_complete} ${this.props.loan.client.surname} (${this.props.loan.client.client_id})`,
          }],
        },
      });
    });
  }

  handleInputChange(key, event) {
    this.setState({
      response: null,
      [key]: event.target.value,
      initial: false,
    });
  }

  onClosingModal() {
    this.props.onClosingModal();
    this.setState({
      initial: true,
      response: null,
    });
  }

  render() {
    return (

      <Modal

      id={'edit_payment_modal'}

      show={this.props.show}

      onClosing={this.onClosingModal.bind(this)}

      heading={
        <h5>Editar abono</h5>
      }

      body={
        <div>
          <div className="center-align">
            { this.state.response ? <Response isError={this.state.response.isError} messages={this.state.response.messages} /> : '' }
          </div>
          <form className="col s12" onSubmit={this.createPayment.bind(this)}>
          <div className="row">
            <div className="input-field col s6">
              <input id="amount" name="amount" type="text" className="validate" value={this.state.amount} onChange={this.handleInputChange.bind(this, 'amount')} />
              <label className="active" htmlFor="amount">Cantidad</label>
            </div>
            <div className="input-field col s6">
              <input id="created" name="created" type="text" className="validate" value={this.state.created} onChange={this.handleInputChange.bind(this, 'created')} />
              <label className="active" htmlFor="created">Creado</label>
            </div>
            <div className="col s6 center-align" style={{ marginTop: '25px' }}>
              <a className="modal-action modal-close waves-effect waves-green black-text btn grey lighten-3">Cerrar</a>
              <button className="waves-effect waves-light btn">Agregar</button>
            </div>
          </div>
          </form>
        </div>
      }/>
    );
  }
}

EditPayment.propTypes = {
  onEdit: React.PropTypes.func.isRequired,
  onClosingModal: React.PropTypes.func.isRequired,
  loanService: React.PropTypes.object.isRequired,
  loan: React.PropTypes.object.isRequired,
  payment: React.PropTypes.object.isRequired,
  show: React.PropTypes.bool.isRequired,
};
