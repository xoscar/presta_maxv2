import React from 'react';

import DeleteLoan from '../main/delete.jsx';

import FloattingButton from '../../floattingButton/index.jsx';

import NewPayment from '../../payments/new.jsx';

export default class Options extends React.Component {
  constructor() {
    super();

    this.state = {
      showDeleteLoan: false,
      showNewPayment: false,
    };

    this.initialState = {
      showDeleteLoan: false,
      showNewPayment: false,
    };
  }

  componentDidUpdate() {
    if (this.state.delete) {
      this.context.router.push('/loans');
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
        <DeleteLoan onDelete={this.onDelete.bind(this)} onClosingModal={this.onClosingModal.bind(this, 'showDeleteLoan')} loanService={this.props.loanService} show={this.state.showDeleteLoan} loan={this.props.loan}/>
        <NewPayment onCreate={this.props.onRefresh} onClosingModal={this.onClosingModal.bind(this, 'showNewPayment')} loan={this.props.loan} loanService={this.props.loanService} show={this.state.showNewPayment}/>
        <FloattingButton
          items = {[
            <a onClick={this.onOpenModal.bind(this, 'showDeleteLoan')} className="btn-floating red darken-1"><i className="material-icons">close</i></a>,
            <a onClick={this.onOpenModal.bind(this, 'showNewPayment')} className="btn-floating blue darken-1"><i className="material-icons">exposure_plus_1</i></a>,
          ]}
        />
      </div>
    );
  }
}

Options.propTypes = {
  onRefresh: React.PropTypes.func.isRequired,
  loan: React.PropTypes.object.isRequired,
  loanService: React.PropTypes.object.isRequired,
};

Options.contextTypes = {
  router: React.PropTypes.object.isRequired,
};
