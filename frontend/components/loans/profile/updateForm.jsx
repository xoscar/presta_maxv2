import React from 'react';

import Response from '../../response/index.jsx';

export default class UpdateForm extends React.Component {
  constructor() {
    super();
    this.state = {
      amount: '',
      weeks: '',
      weekly_payment: '',
      created: '',
    };
  }

  componentWillMount() {
    this.stateFromClient();
  }

  onValueChange(key, event) {
    this.setState({
      [key]: event.target.value,
      response: null,
    });
  }

  stateFromClient() {
    const loan = this.props.loan;
    this.setState({
      amount: loan.amount,
      weeks: loan.weeks,
      weekly_payment: loan.weekly_payment,
      created: loan.created,
    });
  }

  updateLoan(event) {
    event.preventDefault();

    this.props.loanService.update(this.props.loan.id, Object.assign({ client_id: this.props.loan.client.id }, this.state), (err) => {
      this.props.onRefresh();
      this.setState({
        response: {
          isError: err !== null,
          messages: err || [{
            field: 'success',
            message: 'Cliente modificado exitosamente.',
          }],
        },
      });
    });
  }

  render() {
    return (
      <div>
        <div className="col s8 center-align" >
          { this.state.response ? <Response isError={this.state.response.isError} messages={this.state.response.messages} /> : ''}
        </div>
        <form className="col s8" onSubmit={this.updateLoan.bind(this)}>
          <div className="row">
            <div className="input-field col s6">
              <input id="amount" name="amount" type="text" className="uppercase validate" value={this.state.amount} onChange={this.onValueChange.bind(this, 'amount')} />
              <label htmlFor="amount" className="active">Cantidad</label>
            </div>
            <div className="input-field col s6">
              <input id="weeks" name="weeks" type="text" className="uppercase validate" value={this.state.weeks} onChange={this.onValueChange.bind(this, 'weeks')} />
              <label htmlFor="weeks" className="active">Semanas</label>
            </div>
            <div className="input-field col s6">
              <input id="weekly_payment" name="weekly_payment" type="text" className="uppercase validate" value={this.state.weekly_payment} onChange={this.onValueChange.bind(this, 'weekly_payment')} />
              <label className="active" htmlFor="weekly_payment">Pago semanal</label>
            </div>
            <div className="input-field col s6">
              <input id="created" name="created" type="text" className="uppercase validate" value={this.state.created} onChange={this.onValueChange.bind(this, 'created')} />
              <label className="active" htmlFor="created">Creado</label>
            </div>
          </div>
          <div className="row">
            <div className="col s12 right-align">
              <button className="waves-effect waves-light btn">Modificar</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

UpdateForm.propTypes = {
  loan: React.PropTypes.object.isRequired,
  loanService: React.PropTypes.object.isRequired,
  onRefresh: React.PropTypes.func.isRequired,
};
