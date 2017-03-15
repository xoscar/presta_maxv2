import React from 'react';

export default class PaymentRow extends React.Component {
  render() {
    const payment = this.props.payment;
    return (
      <li className="collection-item payment">
        <span className="title green-text text-darken-2">{payment.index} | </span>
        <span className="title green-text text-darken-2">${payment.amount}.00</span>
        <label>
          {payment.created_from_now} ({payment.created})
        </label>
      </li>
    );
  }
}

PaymentRow.propTypes = {
  payment: React.PropTypes.object.isRequired,
};
