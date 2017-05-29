import React from 'react';

import Client from '../../../models/client.jsx';

import UpdateForm from './updateForm.jsx';
import Information from './information.jsx';
import Options from './options.jsx';

import NewPayment from '../../payments/new.jsx';

import Response from '../../response/index.jsx';
import Collapsible from '../../collapsible/index.jsx';

import LoanSmallCard from '../../loans/main/smallCard.jsx';
import ChargeCard from '../../charges/card.jsx';

export default class Profile extends React.Component {
  constructor() {
    super();
    this.clientService = Client({
      headers: {
        user: document.getElementById('user').value,
        token: document.getElementById('token').value,
      },
    });

    this.state = {
      response: null,
      client: null,
      expiredActiveLoans: false,
    };
  }

  componentDidMount() {
    this.onRefresh();
  }

  getInfoFromUser() {
    const client = this.state.client;
    return [{
      heading: (
        <div>
          <i className="material-icons text-darken-2 blue-text">thumbs_up_down</i>
          Prestamos activos
          <span className="right">Adeudo: ${Number(client.loans_depth).toFixed(2)}</span>
        </div>
      ),
      content: (
        <div>
          {
            client.loans.length ? client.loans.map(loan => (
              <LoanSmallCard loan={loan} key={loan.id} active={true} onPaymentModal={this.onOpenModal.bind(this, { loan, showNewPayment: true })} />
            )) : <p>No prestamos activos para mostrar.</p>
          }
        </div>
      ),
    }, {
      heading: (
        <div>
          <i className="material-icons text-darken-2 yellow-text">attach_money</i>
          Cargos activos
          <span className="right">Adeudo: ${Number(client.charges_depth).toFixed(2)}</span>
        </div>
      ),
      content: (
        <div>
          {
            client.charges.length ? client.charges.map(charge => (
              <ChargeCard charge={charge} key={charge.id} active={true} />
            )) : <p>No cargos activos para mostrar.</p>
          }
        </div>
      ),
    }, {
      heading: (
        <div>
          <i className="material-icons text-darken-2 green-text">thumbs_up_down</i>
          Prestamos liquidados
        </div>
      ),
      content: (
        <div>
          {
            client.finished_loans.length ? client.finished_loans.map(loan => (
              <LoanSmallCard loan={loan} key={loan.id} active={false} />
            )) : <p>No prestamos liquidados para mostrar.</p>
          }
        </div>
      ),
    }, {
      heading: (
        <div>
          <i className="material-icons text-darken-2 green-text">attach_money</i>
          Cargos liquidados
        </div>
      ),
      content: (
        <div>
          {
            client.paid_charges.length ? client.paid_charges.map(charge => (
              <ChargeCard charge={charge} key={charge.id} active={false} />
            )) : <p>No cargos liquidados para mostrar.</p>
          }
        </div>
      ),
    }];
  }

  onRefresh() {
    this.clientService.get(this.props.params.clientId, (err, client) => {
      this.setState({
        client,
        response: {
          isError: err !== null,
          messages: err || [{}],
        },
      });
    });
  }

  onOpenModal(state) {
    this.setState(state);
  }

  onClosingModal(key) {
    this.setState({
      [key]: false,
    });
  }

  render() {
    if (!this.state.client) {
      return (<h1>Cargando...</h1>);
    }

    return (
      <div>
        <NewPayment onCreate={this.onRefresh.bind(this)} onClosingModal={this.onClosingModal.bind(this, 'showNewPayment')} loan={this.state.loan} loanService={this.loanService} show={this.state.showNewPayment}/>
        <Options client={this.state.client} onRefresh={this.onRefresh.bind(this)} clientService={this.clientService}/>
        <div className="profile z-depth-1 animated fadeIn">
          <div className="row">
            <div className="col s12">
              <div style={{ marginTop: '2%' }} className="col s12">
                <div className="row">
                  <div className="col s8">
                    <h4 className="capitalize">{this.state.client.name_complete}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="col s12">
              <div className="row">
                <div className="col s8 center-align" >
                  { this.state.response && this.state.response.isError ? <Response isError={this.state.response.isError} messages={this.state.response.messages} /> : ''}
                </div>
                <UpdateForm client={this.state.client} clientService={this.clientService} onRefresh={this.onRefresh.bind(this)}/>
                <Information client={this.state.client}/>
                <div className="row">
                  <div className="col s12">
                    <Collapsible items={this.getInfoFromUser()}/>
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
