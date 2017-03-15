import React from 'react';
import Reflux from 'reflux';
import ReactMixin from 'react-mixin';
import $ from 'jquery';

import LoanActions from '../../actions/loan.jsx';
import LoanStore from '../../stores/loan.jsx';

import ClientActions from '../../actions/client.jsx';

// components
import Response from '../response/index.jsx';

@ReactMixin.decorate(Reflux.connect(LoanStore, 'loans'))
export default class NewLoan extends React.Component {
  constructor() {
    super();
    this.state = {
      new_loan: {
        amount: '',
        weekly_payment: '',
        weeks: '',
        description: '',
      },
      user: document.getElementById('user').value,
      token: document.getElementById('token').value,
    };

    this.initialState = {
      amount: '',
      weekly_payment: '',
      weeks: '',
      description: '',
    };

    this.response = null;
  }

  componentDidMount() {
    LoanActions.setAuth(this.state.user, this.state.token);
    $('.add_loan_modal').openModal();
  }

  createLoan(event) {
    event.preventDefault();

    const body = this.state.new_loan;
    body.client_id = this.props.client.id;
    LoanActions.newLoan(body);
    ClientActions.getClient(this.props.client.id);
  }

  componentDidUpdate() {
    $('.add_loan_modal').openModal();
  }

  handleChange(key, event) {
    const newLoan = this.state.new_loan;
    newLoan[key] = event.target.value;

    this.setState({
      new_loan: newLoan,
    });
  }

  componentWillUpdate() {
    if (this.state.loans) {
      if (this.state.loans.response.type === 'success') {
        this.setState({
          new_loan: this.initialState,
        });
      }

      this.response = this.state.loans.response;
    }
  }

  render() {
    return (
      <div>
        <div className="modal add_loan_modal">
          <div className="modal-content">
            <div className="col s12">
              <h5>Añadir prestamo</h5>
            </div>
            <div className="col s12 center-align">
              <Response response={this.response} />
            </div>
            <form className="col s12" onSubmit={this.createLoan.bind(this)}>
              <div className="row">
                <div className="input-field col s4">
                  <input id="amount" name="amount" type="text" className="validate" value={this.state.amount} onChange={this.handleChange.bind(this, 'amount')}/>
                  <label htmlFor="amount">Cantidad</label>
                </div>
                <div className="input-field col s4">
                  <input id="weekly_payment" name="weekly_payment" type="text" className="validate" value={this.state.weekly_payment} onChange={this.handleChange.bind(this, 'weekly_payment')} />
                  <label htmlFor="weekly_payment">Pago semanal</label>
                </div>
                <div className="input-field col s4">
                  <input id="weeks" name="weeks" type="text" className="validate" value={this.state.weeks} onChange={this.handleChange.bind(this, 'weeks')} />
                  <label htmlFor="weeks">Semanas</label>
                </div>
                <div className="input-field col s12">
                  <textarea id="description" name="description" className="materialize-textarea uppercase" value={this.state.description} onChange={this.handleChange.bind(this, 'description')}></textarea>
                  <label htmlFor="description">Descripción</label>
                </div>
              </div>
              <div className="row">
                <div className="col s12 right-align">
                  <a className="modal-action modal-close waves-effect waves-green black-text btn grey lighten-3">Cerrar</a>
                  <button className="waves-effect waves-light btn">Crear</button>
                </div>
              </div>
            </form>
        </div>
      </div>
    </div>
    );
  }
}

NewLoan.propTypes = {
  client: React.PropTypes.object.isRequired,
};
