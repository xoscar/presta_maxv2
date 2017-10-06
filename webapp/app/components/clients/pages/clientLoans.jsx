// dependencies
import React from 'react';
import { Modal } from 'react-materialize';
import $ from 'jquery';

// models
import Client from '../../../models/client.jsx';

// libs
import { getAuth } from '../../../utils/auth.jsx';

// components
import { LoanSmallCard } from '../../loans/base.jsx';
import { PaymentCard } from '../../payments/base.jsx';
import Loader from '../../loader/loader.jsx';

export default class ClientLoans extends React.Component {
  constructor() {
    super();

    this.state = this.initialState = {
      loans: null,
      selectedLoan: null,
      response: null,
    };

    this.clientService = Client({
      headers: getAuth(),
    });
  }

  componentDidMount() {
    this._mounted = true;
  }

  getClientLoans() {
    this.clientService.loans(this.props.client.id)

    .then(({ data, statusCode }) => (
      this.setState({
        loans: data.loans,
        selectedLoan: data.loans.filter(loan => (
          this.state.selectedLoan && loan.id === this.state.selectedLoan.id
        ))[0],
        response: {
          data: {
            messages: [],
          },
          statusCode,
        },
      })
    ))

    .catch((err) => {
      this.setState({
        response: {
          isError: true,
          err,
        },
      });
    });
  }

  changeLoan(selectedLoan, event) {
    event.preventDefault();
    this.setState({
      selectedLoan,
    });
  }

  componentWillUnmount() {
    this._mounted = false;
    return $('.modal-overlay').length && $('.modal.open').modal('close');
  }

  render() {
    return (
      <Modal

      id={`client_loans_modal_${this.props.client.id}`}

      modalOptions={{
        complete: () => {
          if (this._mounted) {
            this.props.onClosingModal();
          }
        },

        ready: () => {
          this.getClientLoans();
        },
      }}

      header={`Prestamos de ${this.props.client.name_complete}`}

      actions={
        <div>
          <a className="modal-action modal-close waves-effect waves-light grey-text btn-flat">Cerrar</a>
          <a className="waves-effect modal-close waves-green btn-flat green-text">Aceptar</a>
        </div>
      }

      trigger= {
        <a className="white-text">Prestamos</a>
      }
      >
        { this.state.response && this.state.response.statusCode >= 400 ? <Response isError={this.state.response.isError} err={this.state.response.err} success={this.state.response.success} /> : '' }
        { !this.state.loans ? <Loader/> : (
          <div className="row">
            <div className="col s6">
              <h5>Prestamos</h5>
              {
                this.state.loans.map(loan => (
                  <div key={loan.id}>
                    <LoanSmallCard onContentClick={this.changeLoan.bind(this, loan)} onRefresh={this.getClientLoans.bind(this)} loan={loan}/>
                  </div>
                ))
              }
            </div>
            <div className="col s6">
              <h5>Pagos</h5>
              {
                this.state.selectedLoan ? this.state.selectedLoan.payments.map((payment, index) => (
                  <PaymentCard payment={payment} key={payment.id} number={index + 1} loan={this.state.selectedLoan} onRefresh={this.getClientLoans.bind(this)}/>
                )) : <p>Prestamo no selecionado</p>
              }
            </div>
          </div>
        )
      }
      </Modal>
    );
  }
}

ClientLoans.propTypes = {
  client: React.PropTypes.object.isRequired,
  onClosingModal: React.PropTypes.func.isRequired,
};
