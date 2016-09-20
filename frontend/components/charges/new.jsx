import { Component } from 'react';

import Response from '../../response/index.jsx';

export default class NewLoan extends Component {
  constructor() {
    super();
    this.state = {
      amount: null,
      description: null,
    };

    this.initialState = {
      amount: null,
      description: null,
    };
  }

  componentDidUpdate() {
    $('.add_charge_modal').openModal();
  }

  componentDidMount() {
    $('.add_charge_modal').openModal();
  }

  handleChange(key, event) {
    this.state[key] = event.target.value;
  }

  render() {
    return (
      <div class="modal add_charge_modal">
        <div class="modal-content">
         <div class="col s12">
            <h5>Añadir cargo</h5>
          </div>
          <div class="col s12 center-align">
            <Response response={this.props.response}/>
          </div>
          <form class="col s12 add_charge_form" onSubmit={this.props.onAction}>
            <div class="row">
              <div class="input-field col s6">
                <input id="amount" name="amount" type="text" class="validate"  value={this.state.amount} onChange={this.handleChange.bind(this, 'amount')}/>
                <label for="amount">Cantidad</label>
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
