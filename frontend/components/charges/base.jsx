import React from 'react';

import Charge from '../../models/charge.jsx';

export default class ChargeComponent extends React.Component {
  constructor() {
    super();

    const headers = {
      user: document.getElementById('user').value,
      token: document.getElementById('token').value,
    };

    this.chargeService = Charge({
      headers,
    });
  }
}
