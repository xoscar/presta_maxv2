import React from 'react';
import Reflux from 'reflux';
import ReactMixin from 'react-mixin';

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

    var body = this.state.new_loan;
    body.client_id = this.props.client.id;
    LoanActions.newLoan(body);
    ClientActions.getClient(this.props.client.id);
  }

  componentDidUpdate() {
    $('.add_loan_modal').openModal();
  }

  handleChange(key, event) {
    this.state.new_loan[key] = event.target.value;
  }

  componentWillUpdate() {
    if(this.state.loans) {
      if(this.state.loans.response.type === 'success')
        this.setState({
          new_loan : this.initialState,
        });
      this.response = this.state.loans.response;
    }
  }

  render() {
    return (
      <div>
        <div class="modal add_loan_modal">
          <div class="modal-content">
            <div class="col s12">
              <h5>Añadir prestamo</h5>
            </div>
            <div class="col s12 center-align">
              <Response response={this.response} />
            </div>
            <form class="col s12" onSubmit={this.createLoan.bind(this)}>
              <div class="row">
                <div class="input-field col s4">
                  <input id="amount" name="amount" type="text" class="validate" value={this.state.amount} onChange={this.handleChange.bind(this, 'amount')}/>
                  <label for="amount">Cantidad</label>
                </div>
                <div class="input-field col s4">
                  <input id="weekly_payment" name="weekly_payment" type="text" class="validate" value={this.state.weekly_payment} onChange={this.handleChange.bind(this, 'weekly_payment')} />
                  <label for="weekly_payment">Pago semanal</label>
                </div>
                <div class="input-field col s4">
                  <input id="weeks" name="weeks" type="text" class="validate" value={this.state.weeks} onChange={this.handleChange.bind(this, 'weeks')} />
                  <label for="weeks">Semanas</label>
                </div>
                <div class="input-field col s12">
                  <textarea id="description" name="description" class="materialize-textarea uppercase" value={this.state.description} onChange={this.handleChange.bind(this, 'description')}></textarea>
                  <label for="description">Descripción</label>
                </div>
              </div>
              <div class="row">
                <div class="col s12 right-align">
                  <a class="modal-action modal-close waves-effect waves-green black-text btn grey lighten-3">Cerrar</a>
                  <button class="waves-effect waves-light btn">Crear</button>
                </div>
              </div>
            </form>
        </div>
      </div>
    </div>
    );
  }
}
