import React from 'react';

import DeleteClient from '../main/delete.jsx';

import FloattingButton from '../../floattingButton/index.jsx';

import Loan from '../../../models/loan.jsx';
import Charge from '../../../models/charge.jsx';

import NewLoan from '../../loans/main/new.jsx';
import NewCharge from '../../charges/new.jsx';

export default class Options extends React.Component {
  constructor() {
    super();

    this.headers = {
      user: document.getElementById('user').value,
      token: document.getElementById('token').value,
    };

    this.loanService = Loan({
      headers: this.headers,
    });

    this.chargeService = Charge({
      headers: this.headers,
    });

    this.state = {
      showDeleteClient: false,
      showCreateLoan: false,
      showCreateCharge: false,
    };

    this.initialState = {
      showDeleteClient: false,
      showCreateLoan: false,
      showCreateCharge: false,
    };
  }

  componentDidUpdate() {
    if (this.state.delete) {
      this.context.router.push('/clients');
    }
  }

  onDelete() {
    this.setState(Object.assign({ delete: true }, this.initialState));
  }

  onClosingModal(key) {
    this.setState({
      [key]: false,
    });
  }

  onOpenModal(key) {
    this.setState({
      [key]: true,
    });
  }

  render() {
    return (
      <div>
        <NewLoan onCreate={this.props.onRefresh} onClosingModal={this.onClosingModal.bind(this, 'showCreateLoan')} loanService={this.loanService} show={this.state.showCreateLoan} client={this.props.client}/>
        <NewCharge onCreate={this.props.onRefresh} onClosingModal={this.onClosingModal.bind(this, 'showCreateCharge')} chargeService={this.chargeService} show={this.state.showCreateCharge} client={this.props.client}/>
        <DeleteClient onDelete={this.onDelete.bind(this)} onClosingModal={this.onClosingModal.bind(this, 'showDeleteClient')} clientService={this.props.clientService} show={this.state.showDeleteClient} client={this.props.client}/>
        <FloattingButton
          items = {[
            <a onClick={this.onOpenModal.bind(this, 'showDeleteClient')} className="btn-floating red darken-1"><i className="material-icons">close</i></a>,
            <a onClick={this.onOpenModal.bind(this, 'showCreateLoan')} className="btn-floating blue darken-1"><i className="material-icons">exposure_plus_1</i></a>,
            <a onClick={this.onOpenModal.bind(this, 'showCreateCharge')} className="btn-floating amber darken-4"><i className="material-icons">attach_money</i></a>,
          ]}
        />
      </div>
    );
  }
}

Options.propTypes = {
  onRefresh: React.PropTypes.func.isRequired,
  client: React.PropTypes.object.isRequired,
  clientService: React.PropTypes.object.isRequired,
};

Options.contextTypes = {
  router: React.PropTypes.object.isRequired,
};
