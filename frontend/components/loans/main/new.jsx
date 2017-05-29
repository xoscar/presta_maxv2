import React from 'react';

// components
import Response from '../../response/index.jsx';

import Modal from '../../modal/index.jsx';

export default class NewLoan extends React.Component {
  constructor() {
    super();
    this.state = {
      amount: '',
      weekly_payment: '',
      weeks: '',
      description: '',
      response: null,
      initial: true,
      client: {
        client_id: '',
      },
    };

    this.initialState = {
      amount: '',
      weekly_payment: '',
      weeks: '',
      description: '',
      initial: true,
    };
  }

  componentDidUpdate() {
    if (this.state.response && !this.state.response.isError && !this.state.initial) {
      this.setState(this.initialState);
    }
  }

  createLoan(event) {
    event.preventDefault();

    if ((this.props.client && !this.props.client.client_id) || (!this.props.client && !this.state.client.id)) {
      return this.setState({
        response: {
          isError: true,
          messages: [{
            field: 'clientId',
            message: 'Cliente no seleccionado',
          }],
        },
      });
    }

    return this.props.loanService.create(Object.assign({ client_id: this.props.client ? this.props.client.id : this.state.client.id }, this.state), (err, loan) => {
      if (!err) {
        this.props.onCreate();
      }

      this.setState({
        response: {
          isError: err !== null,
          messages: err || [{
            field: 'success',
            message: `Prestamo añadido exitosamente a ${loan.client.name_complete} ${loan.client.surname} (${loan.client.client_id})`,
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
    this.setState(Object.assign({}, this.initialState, {
      response: null,
    }));
  }

  changeClient(client) {
    this.setState({
      client,
    });
  }

  onClientSearch(event) {
    this.setState({
      client: {
        client_id: event.target.value,
        response: null,
      },
    });

    this.props.onClientSearch(event);
  }

  render() {
    return (

      <Modal

      id={'add_loan_modal'}

      show={this.props.show}

      onClosing={this.onClosingModal.bind(this)}

      heading={
        <h5>Añadir prestamo</h5>
      }

      body={
      <div>
        <div className="col s12 center-align">
          { this.state.response ? <Response isError={this.state.response.isError} messages={this.state.response.messages} /> : '' }
        </div>
        <form className="col s12" onSubmit={this.createLoan.bind(this)}>
          <div className="row">
            <div className="input-field col s4">
              <input id="amount" name="amount" type="text" className="validate" value={this.state.amount} onChange={this.handleInputChange.bind(this, 'amount')}/>
              <label htmlFor="amount">Cantidad</label>
            </div>
            <div className="input-field col s4">
              <input id="weekly_payment" name="weekly_payment" type="text" className="validate" value={this.state.weekly_payment} onChange={this.handleInputChange.bind(this, 'weekly_payment')} />
              <label htmlFor="weekly_payment">Pago semanal</label>
            </div>
            <div className="input-field col s4">
              <input id="weeks" name="weeks" type="text" className="validate" value={this.state.weeks} onChange={this.handleInputChange.bind(this, 'weeks')} />
              <label htmlFor="weeks">Semanas</label>
            </div>
            <div className="input-field col s12">
              <textarea id="description" name="description" className="materialize-textarea uppercase" value={this.state.description} onChange={this.handleInputChange.bind(this, 'description')}></textarea>
              <label htmlFor="description">Descripción</label>
            </div>
            {
              !this.props.client && this.props.clients ?
                <div>
                <div className="input-field col s12">
                  <input id="client" name="client" type="text" className="validate" value={this.state.client.client_id} onChange={this.onClientSearch.bind(this)} />
                  <label htmlFor="client">Cliente</label>
                </div>
                <div>
                  {
                    this.props.clients.map(client => (
                      <div className="chip" onClick={this.changeClient.bind(this, client)} key={client.id + Date.now()} style={{ cursor: 'pointer' }}>
                        <span>{ `${client.client_id} - ${client.name_complete} ${client.surname}` }</span>
                      </div>
                    ))
                  }
                </div>
              </div> : ''
            }
          </div>
          <div className="row">
            <div className="col s12 right-align">
              <a className="modal-action modal-close waves-effect waves-green black-text btn grey lighten-3">Cerrar</a>
              <button className="waves-effect waves-light btn">Crear</button>
            </div>
          </div>
        </form>
      </div>
      }/>
    );
  }
}

NewLoan.propTypes = {
  onCreate: React.PropTypes.func.isRequired,
  onClosingModal: React.PropTypes.func.isRequired,
  loanService: React.PropTypes.object.isRequired,
  show: React.PropTypes.bool.isRequired,
  client: React.PropTypes.object,
  clients: React.PropTypes.arrayOf(React.PropTypes.object),
  onClientSearch: React.PropTypes.func,
};
