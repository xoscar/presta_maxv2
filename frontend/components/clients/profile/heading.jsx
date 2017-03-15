import React from 'react';

export default class ProfileHeading extends React.Component {
  render() {
    const client = this.props.client;

    return (
      <div className="col s12">
        <div style={{ marginTop: '2%' }} className="col s12">
          <div className="row">
            <div className="col s8">
              <h4 className="capitalize">{client.name_complete}</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProfileHeading.propTypes = {
  client: React.PropTypes.object.isRequired,
};
