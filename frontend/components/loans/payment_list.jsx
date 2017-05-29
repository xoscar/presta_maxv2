import React from 'react';

import PaymentRow from './payment_row.jsx';

export default class PaymentList extends React.Component {
  render() {
    const payments = this.props.payments;

    if (!payments) {
      return (<div></div>);
    }

    const paymentList = payments.map((payment, index) => {
      payment.index = (index + 1);
      return <PaymentRow payment={payment} key={payment.id}/>;
    });

    return (
      <div>
        <ul className="collection">
          { paymentList.length > 0 ? paymentList :
              <li className="collection-item payment">
                <span className="title text-darken-2">No se han realizado pagos.</span>
            </li>
          }
        </ul>
      </div>
    );
  }
}

PaymentList.propTypes = {
  payments: React.PropTypes.array.isRequired,
};
