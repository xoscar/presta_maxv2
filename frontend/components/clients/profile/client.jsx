import React from 'react';

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
    const client = this.props.client;

    if (!this.props.client) {
      return (<h1>Cargando..</h1>);
    }

    return (
      <div>
        <div className="profile z-depth-1 animated fadeIn">
          <div className="row">
            <Heading client={client} />
            <div className="col s12">
              <div className="row">
                <div className="col s8 center-align" >
                  <Response response={this.props.response} />
                </div>
                <UpdateForm client={client}/>
                <Information client={client}/>
                <div className="row">
                  <div className="col s12">
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

Client.propTypes = {
  client: React.PropTypes.object.isRequired,
  response: React.PropTypes.object.isRequired,
  onAction: React.PropTypes.object.isRequired,
};
