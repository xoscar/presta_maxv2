import React from 'react';

import { Link } from 'react-router';

import Loan from '../../../models/loan.jsx';

export default class LoanSmallCard extends React.Component {
  constructor() {
    super();

    this.loanService = Loan({
      headers: {
        user: document.getElementById('user').value,
        token: document.getElementById('token').value,
      },
    });

    this.state = {
      showNewPayment: false,
    };
  }

  componentWillMount() {
    this.setState({
      loan: this.props.loan,
    });
  }

  onNewPaymentModal() {
    this.props.onPaymentModal();
  }

  onRefresh() {
    this.loanService.get(this.state.loan.id, (err, loan) => {
      this.setState({
        loan,
      });
    });
  }

  onClosingModal(key) {
    this.setState({
      [key]: false,
    });
  }

  render() {
    return (
      <div className="col s6">
        <div className="card" style={{ height: '169px' }}>
          <div className="card-content white avatar text-darken-2 ">
            <div className="row" style={{ margin: '0px' }}>
              <div className="col s6">
                { this.props.active ? <p>Adeudo: ${this.state.loan.current_balance + '.00'}</p> : '' }
                <p>Creado: {this.state.loan.created_from_now} <span style={{ fontSize: '.7rem' }}>({this.state.loan.created})</span></p>
                { !this.props.active ? <p>Liquidado: {this.state.loan.finished_date}</p> : '' }
              </div>
              <div className="col s6">
                <p>Cantidad: ${this.state.loan.amount + '.00'} </p>
                <p>Semanal: ${this.state.loan.weekly_payment + '.00'} </p>
                { this.state.loan.last_payment ? <p>Abono: {this.state.loan.last_payment_from_now} </p> : <p>No se han realizado pagos</p> }
              </div>
            </div>
          </div>
          <div className="card-action">
            <Link to={`/this.state.loans/${this.state.loan.id}`} className="green-text darken-2">Más</Link>
            { this.props.active ? <a className="blue-text text-darken-2" onClick={this.onNewPaymentModal.bind(this)}>Abonar</a> : '' }
            { this.state.loan.expired ? <div className="chip right red white-text"> Expirado </div> : '' }
          </div>
        </div>
      </div>
    );
  }
}

LoanSmallCard.propTypes = {
  loan: React.PropTypes.object.isRequired,
  active: React.PropTypes.bool,
  onPaymentModal: React.PropTypes.func,
};
