import React from 'react';

// components
import Response from '../response/index.jsx';
import Modal from '../modal/index.jsx';

export default class NewPayment extends React.Component {
  constructor() {
    super();
    this.state = {
      amount: '',
      initial: true,
    };

    this.initialState = {
      amount: '',
      initial: true,
    };
  }

  componentDidUpdate() {
    if (this.state.response && !this.state.response.isError && !this.state.initial) {
      this.setState(Object.assign(this.initialState, {
        amount: this.props.loan.weekly_payment,
      }));
    } else if (this.state.initial && !this.state.response) {
      this.setState({
        initial: false,
        amount: this.props.loan.weekly_payment,
      });
    }
  }

  componentWillMount() {
    this.setState({
      amount: this.props.loan.weekly_payment,
    });
  }

  createPayment(event) {
    event.preventDefault();

    return this.props.loanService.get(this.props.loan.id, (searchErr, loan) => {
      this.props.loanService.createPayment(loan.id, this.state, (err) => {
        if (!err) {
          this.props.onCreate();
        }

        this.setState({
          response: {
            isError: err !== null,
            messages: err || [{
              field: 'success',
              message: `Abono añadido exitosamente a ${loan.client.name_complete} ${loan.client.surname} (${loan.client.client_id})`,
            }],
          },
        });
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
    this.setState(Object.assign({}, this.initialState, {
      response: null,
    }));
  }

  render() {
    return (

      <Modal

      id={'add_payment_modal'}

      show={this.props.show}

      onClosing={this.onClosingModal.bind(this)}

      heading={
        <h5>Agregar abono</h5>
      }

      body={
        <div>
          <div className="center-align">
            { this.state.response ? <Response isError={this.state.response.isError} messages={this.state.response.messages} /> : '' }
          </div>
          <form className="col s12" onSubmit={this.createPayment.bind(this)}>
          <div className="row">
            <div className="input-field col s6">
              <input id="amount" name="amount" type="text" className="validate" value={this.state.amount || ''} onChange={this.handleInputChange.bind(this, 'amount')} />
              <label className="active" htmlFor="amount">Cantidad</label>
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

NewPayment.propTypes = {
  onCreate: React.PropTypes.func.isRequired,
  onClosingModal: React.PropTypes.func.isRequired,
  loanService: React.PropTypes.object.isRequired,
  loan: React.PropTypes.object.isRequired,
  show: React.PropTypes.bool.isRequired,
};
