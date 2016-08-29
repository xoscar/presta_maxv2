import React from 'react';

export default class PaymentRow extends React.Component {
  constructor() {
    super();
  }

  render() {
    var payment = this.props.payment;
    return (
      <li class="collection-item payment">
        <span class="title green-text text-darken-2">{payment.index} | </span>
        <span class="title green-text text-darken-2">${payment.amount}.00</span>
        <label>
          {payment.created_from_now} ({payment.created})
        </label>
      </li>
     );
  }
}
