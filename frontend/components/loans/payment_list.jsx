import React from 'react';

import PaymentRow from './payment_row.jsx';

export default class PaymentList extends React.Component {
  constructor() {
    super();
  }

  render() {
    var payments = this.props.payments;
    if (!payments) return(<div></div>);
    var paymentList = payments.map((payment, index) => {
      payment.index = (index + 1);
      return <PaymentRow payment={payment} key={payment.id}/>;
    });

    return (
      <div>
        <ul class="collection">
          { paymentList.length > 0 ? paymentList :
              <li class="collection-item payment">
                <span class="title text-darken-2">No se han realizado pagos.</span>
            </li>
          }
        </ul>
      </div>
    );
  }
}
