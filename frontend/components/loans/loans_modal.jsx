import React from 'react';
import $ from 'jquery';

import PaymentList from './payment_list.jsx';
import LoanRow from './loan_row.jsx';

export default class LoansModal extends React.Component {
  constructor() {
    super();
    this.state = {
      filter: null,
    };
  }

  setFilter(filter) {
    this.setState({
      filter,
    });
  }

  filterPayments(loans) {
    let payments = loans.length > 0 ? loans[0].payments : [];
    const filter = this.state.filter;

    if (filter) {
      const foundLoan = loans.filter(loan => (
        loan.id === filter
      ))[0];

      payments = foundLoan ? foundLoan.payments : [];
    }

    return <PaymentList payments={payments} />;
  }

  prepareView(client) {
    const selected = this.state.filter;

    const loans = client.loans.map((loan, index) => {
      if (index === 0 && !selected) {
        loan.selected = 'selected';
        this.setState({
          filter: loan.id,
        });
      } else if (selected === loan.id) {
        loan.selected = 'selected';
        this.setState({
          filter: loan.id,
        });
      } else loan.selected = '';

      loan.text_color = !loan.expired ? 'green-text' : 'red-text';
      loan.expired_class = loan.expired ? 'expired' : 'not-expired';
      return <LoanRow loan={loan} key={loan.id} onClick={ this.setFilter.bind(this, loan.id) }/>;
    });

    return {
      payments: this.filterPayments(client.loans),
      loans,
    };
  }

  componentDidMount() {
    if (this.props.client) $('.loans-modal').openModal();
  }

  componentDidUpdate() {
    if (this.props.client) $('.loans-modal').openModal();
  }

  render() {
    const client = this.props.client;
    const view = this.prepareView(client);

    return (
      <div>
        <div className="modal loans-modal modal-fixed-footer" style={{ height: '80%', width: '80%' }}>
          <div className="modal-content modals">
            <div className="row">
              <div className="col s12">
                <h4>Prestamos de <span className="capitalize">{client ? client.name_complete : ''}</span> <span style={{ fontSize: '.7em' }}>({client ? client.client_id : ''})</span></h4>
              </div>
              <div className="row">
                <div className="col s6">
                  <h5>Prestamos</h5>
                  <div className="row">
                    {view.loans}
                  </div>
                </div>
                <div className="col s5 offset-s6" style={{ position: 'fixed', marginTop: '47px' }}>
                  <div className="row">
                    <div className="col s12">
                      <h5>Pagos</h5>
                      <div className="row payments">
                        {view.payments}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <a className=" modal-action modal-close waves-effect waves-green btn-flat">Cerrar</a>
          </div>
        </div>
      </div>
    );
  }
}

LoansModal.propTypes = {
  client: React.PropTypes.object.isRequired,
};
