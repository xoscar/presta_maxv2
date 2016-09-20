import { Component } from 'react';

import Response from '../../response/index.jsx';

export default class NewLoan extends Component {
  constructor() {
    super();
    this.state = {
      amount: null,
      weekly_payment: null,
      weeks: null,
      description: null,
    };

    this.initialState = {
      amount: null,
      weekly_payment: null,
      weeks: null,
      description: null,
    };
  }

  componentDidUpdate() {
    $('.add_loan_modal').openModal();
  }

  componentDidMount() {
    $('.add_loan_modal').openModal();
  }

  handleChange(key, event) {
    this.state[key] = event.target.value;
  }

  render() {
    return (
      <div class="modal add_loan_modal">
        <div class="modal-content">
          <div class="col s12">
            <h5>Añadir prestamo</h5>
          </div>
          <div class="col s12 add_loan_response center-align">
            <Response response={this.props.response} />
          </div>
          <form class="col s12" onSubmit={this.props.onAction}>
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
    );
  }
}
