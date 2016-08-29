import React from 'react';

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
      filter: filter,
    });
  }

  filterPayments(loans) {
    var payments = loans.length > 0 ? loans[0].payments : [];
    var filter = this.state.filter;
    if (filter) {
      var loan = loans.filter((loan) => {
        return loan.id === filter;
      })[0];

      payments = loan ? loan.payments : [];
    }

    return <PaymentList payments={payments} />;
  }

  prepareView(client) {
    var loans = null;
    var payments =  null;
    if (client) {
      var selected = this.state.filter;
      loans = client.loans.map((loan, index) => {
        if (index === 0 && !selected) {
          loan.selected = 'selected';
          this.state.filter = loan.id;
        } else if (selected === loan.id) {
          loan.selected = 'selected';
          this.state.filter = loan.id;
        }

        loan.text_color = !loan.expired ? 'green-text' : 'red-text';
        loan.expired_class = loan.expired ? 'expired' : 'not-expired';
        return <LoanRow loan={loan} key={loan.id} onClick={ this.setFilter.bind(this, loan.id) }/>;
      });
    }

    var payments = this.filterPayments(client.loans);
    return {
      payments,
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
    var client = this.props.client;
    var view = this.prepareView(client);
    return (
      <div>
        <div class="modal loans-modal modal-fixed-footer" style={{ height: '80%', width: '80%' }}>
          <div class="modal-content modals">
            <div class ="row">
              <div class="col s12">
                <h4>Prestamos de <span class="capitalize">{client ? client.name_complete : ''}</span> <span style={{ fontSize: '.7em' }}>({client ? client.client_id: ''})</span></h4>
              </div>
              <div class="row">
                <div class="col s6">
                  <h5>Prestamos</h5>
                  <div class ="row">
                    {view.loans}
                  </div>
                </div>
                <div class="col s5 offset-s6"  style={{ position:'fixed', marginTop: '47px' }}>
                  <div class="row">
                    <div class="col s12">
                      <h5>Pagos</h5>
                      <div class="row payments">
                        {view.payments}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <a class=" modal-action modal-close waves-effect waves-green btn-flat">Cerrar</a>
          </div>
        </div>
      </div>
    );
  }
}
