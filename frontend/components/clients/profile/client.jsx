import React from 'react';

import ClientActions from '../../../actions/client.jsx';

// exterior components
import Response from '../../response/index.jsx';

// client components
import UpdateForm from './update.jsx';
import Information from './information.jsx';
import Heading from './heading.jsx';
import LoansAndCharges from './loans_and_charges.jsx';
import ActionButton from './action_button.jsx';

export default class Client extends React.Component {
  constructor() {
    super();
    this.client = null;
  }

  render() {
    if (!this.props.client) return (<h1>Cargando..</h1>);
    var client = this.client = this.props.client;

    return (
      <div>
        <div class="profile z-depth-1 animated fadeIn">
          <div class="row">
            <Heading client={client} />
            <div class ="col s12">
              <div class="row">
                <div class="col s8 center-align" >
                  <Response response={this.props.response} />
                </div>
                <UpdateForm  client={client}/>
                <Information  client={client}/>
                <div class="row">
                  <div class="col s12">
                    <LoansAndCharges client={client} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ActionButton onAction={this.props.onAction} />
        </div>
      </div>
    );
  }
}
