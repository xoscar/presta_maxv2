import React from 'react';

export default class ProfileHeading extends React.Component {
  constructor() {
    super();
  }

  render() {
    var client = this.props.client;

    return (
      <div class="col s12">
        <div style={{ marginTop: '2%' }} class="col s12">
          <div class="row">
            <div class="col s8">
              <h4 class="capitalize">{client.name_complete}</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
