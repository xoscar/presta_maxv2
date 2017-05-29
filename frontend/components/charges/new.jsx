import React from 'react';

import Response from '../response/index.jsx';
import Modal from '../modal/index.jsx';

export default class NewCharge extends React.Component {
  constructor() {
    super();

    this.state = {
      amount: '',
      description: '',
      response: null,
      initial: true,
    };

    this.initialState = {
      amount: '',
      description: '',
      initial: true,
    };
  }

  componentDidUpdate() {
    if (this.state.response && !this.state.response.isError && !this.state.initial) {
      this.setState(this.initialState);
    }
  }

  createCharge(event) {
    event.preventDefault();
    this.props.chargeService.create(Object.assign({ client_id: this.props.client.id }, this.state), (err) => {
      if (!err) {
        this.props.onCreate();
      }

      this.setState({
        response: {
          isError: err !== null,
          messages: err || [{
            field: 'success',
            message: `Cargo añadido exitosamente a ${this.props.client.name_complete}`,
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

  render() {
    return (
      <Modal

      id={'add_charge_modal'}

      show={this.props.show}

      onClosing={this.onClosingModal.bind(this)}

      heading={
        <h5>Añadir cargo</h5>
      }

      body={
        <div>
          <div className="col s12 center-align">
            { this.state.response ? <Response isError={this.state.response.isError} messages={this.state.response.messages} /> : '' }
          </div>
          <form className="col s12 add_charge_form" onSubmit={this.createCharge.bind(this)}>
            <div className="row">
              <div className="input-field col s6">
                <input id="amount" name="amount" type="text" className="validate" value={this.state.amount} onChange={this.handleInputChange.bind(this, 'amount')}/>
                <label htmlFor="amount">Cantidad</label>
              </div>
              <div className="input-field col s12">
                <textarea id="description" name="description" className="materialize-textarea uppercase" value={this.state.description} onChange={this.handleInputChange.bind(this, 'description')}></textarea>
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
      }/>
    );
  }
}

NewCharge.propTypes = {
  chargeService: React.PropTypes.object.isRequired,
  onCreate: React.PropTypes.func.isRequired,
  show: React.PropTypes.bool.isRequired,
  client: React.PropTypes.object.isRequired,
  onClosingModal: React.PropTypes.func.isRequired,
};
