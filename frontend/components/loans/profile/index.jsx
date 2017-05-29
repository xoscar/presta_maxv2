import React from 'react';

import Loan from '../../../models/loan.jsx';

import UpdateForm from './updateForm.jsx';
import Information from './information.jsx';
import Options from './options.jsx';

import Response from '../../response/index.jsx';
// import Collapsible from '../../collapsible/index.jsx';

import PaymentCard from '../../payments/card.jsx';
import EditPayment from '../../payments/edit.jsx';

export default class Profile extends React.Component {
  constructor() {
    super();
    this.loanService = Loan({
      headers: {
        user: document.getElementById('user').value,
        token: document.getElementById('token').value,
      },
    });

    this.state = {
      response: null,
      loan: null,
      expiredActiveLoans: false,
      showEditModal: false,
    };
  }

  componentDidMount() {
    this.onRefresh();
  }

  closeEditModal() {
    this.setState({
      payment: null,
      showEditModal: false,
    });
  }

  showEditModal(payment) {
    this.setState({
      payment,
      showEditModal: true,
    });
  }

  onRefresh() {
    this.loanService.get(this.props.params.loanId, (err, loan) => {
      this.setState({
        loan,
        response: {
          isError: err !== null,
          messages: err || [{}],
        },
      });
    });
  }

  render() {
    if (!this.state.loan) {
      return (<h1>Cargando...</h1>);
    }

    return (
      <div>
        <Options loan={this.state.loan} onRefresh={this.onRefresh.bind(this)} loanService={this.loanService}/>
        <EditPayment show={this.state.showEditModal} onEdit={this.onRefresh.bind(this)} onClosingModal={this.closeEditModal.bind(this)} loanService={this.loanService} loan={this.state.loan} payment={this.state.payment} />
        <div className="profile z-depth-1 animated fadeIn">
          <div className="row">
            <div className="col s12">
              <div style={{ marginTop: '2%' }} className="col s12">
                <div className="row">
                  <div className="col s8">
                    <h4 className="capitalize">{this.state.loan.client.name_complete}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="col s12">
              <div className="row">
                <div className="col s8 center-align" >
                  { this.state.response && this.state.response.isError ? <Response isError={this.state.response.isError} messages={this.state.response.messages} /> : ''}
                </div>
                <UpdateForm loan={this.state.loan} loanService={this.loanService} onRefresh={this.onRefresh.bind(this)}/>
                <Information loan={this.state.loan}/>
                  <div className="row">
                    <div className="col s12">
                      <div className="row">
                        <div className="col s12">
                        {
                          this.state.loan.payments.length !== 0 ?
                          <div>
                            <div className="row">
                              <h5>Pagos</h5>
                            </div>
                            <div className="row animated fadeIn">
                              {
                                this.state.loan.payments.map(payment => (
                                  <PaymentCard payment={payment} showEditModal={this.showEditModal.bind(this, payment)} key={payment.id} loan={this.state.loan} loanService={this.loanService} onRefresh={this.onRefresh.bind(this)}/>
                                ))
                              }
                            </div>
                          </div> :
                          <div className="row">
                            <h5>No se han realizado pagos.</h5>
                          </div>
                        }
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Profile.propTypes = {
  params: React.PropTypes.object.isRequired,
};
