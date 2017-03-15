import React from 'react';
import $ from 'jquery';

import Response from '../response/index.jsx';

export default class NewLoan extends React.Component {
  constructor() {
    super();

    this.state = {
      amount: '',
      description: '',
    };

    this.initialState = {
      amount: '',
      description: '',
    };
  }

  componentDidMount() {
    $('.add_charge_modal').openModal();
  }

  componentDidUpdate() {
    $('.add_loan_modal').openModal();
  }

  handleChange(key, event) {
    this.setState({
      [key]: event.target.value,
    });
  }

  render() {
    return (
      <div className="modal add_charge_modal">
        <div className="modal-content">
         <div className="col s12">
            <h5>Añadir cargo</h5>
          </div>
          <div className="col s12 center-align">
            <Response response={this.props.response}/>
          </div>
          <form className="col s12 add_charge_form" onSubmit={this.props.onAction}>
            <div className="row">
              <div className="input-field col s6">
                <input id="amount" name="amount" type="text" className="validate" value={this.state.amount} onChange={this.handleChange.bind(this, 'amount')}/>
                <label htmlFor="amount">Cantidad</label>
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
    );
  }
}

NewLoan.propTypes = {
  response: React.PropTypes.string,
  onAction: React.PropTypes.func.isRequired,
};
