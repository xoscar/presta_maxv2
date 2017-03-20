import React from 'react';

export default class Card extends React.Component {
  constructor() {
    super();

    this.state = {
      showEditModal: false,
    };
  }

  showEditModal(event) {
    event.preventDefault();

    this.setState({
      showEditModal: true,
    });
  }

  closeEditModal() {
    this.props.onRefresh();
    this.setState({
      showEditModal: false,
    });
  }

  deletePayment(event) {
    event.preventDefault();
    this.props.loanService.deletePayment(this.props.loan.id, this.props.payment.id, () => {
      this.onRefresh();
    });
  }

  render() {
    return (
      <div className="col s4">
        <div className="card">
          <div className="card-content white avatar text-darken-2">
            <p className="card-title">${Number(this.props.payment.amount).toFixed(2)}</p>
            <p className="capitalize">{this.props.payment.created_from_now} <span style={{ fontSize: '.7rem' }}>({this.props.payment.created})</span></p>
          </div>
          <div className="card-action">
            <a className="red-text text-darken-2" onClick={this.deletePayment.bind(this)}><i className="material-icons">close</i></a>
            <a className="yellow-text text-darken-2" onClick={this.props.showEditModal}><i className="material-icons">edit</i></a>
          </div>
        </div>
      </div>
    );
  }
}

Card.propTypes = {
  payment: React.PropTypes.object.isRequired,
  loan: React.PropTypes.object.isRequired,
  loanService: React.PropTypes.object.isRequired,
  onRefresh: React.PropTypes.func.isRequired,
  showEditModal: React.PropTypes.func.isRequired,
};
