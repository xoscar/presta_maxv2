import React from 'react';
import Row from './row.jsx';

export default class Response extends React.Component {

  render() {
    return (
      <div>
        {
          this.props.messages.map(message => (
            <Row backColor={this.props.isError ? 'red' : 'green'} message={message.message} key={`${message.field}-${Date.now()}`}/>
          ))
        }
      </div>
    );
  }
}

Response.propTypes = {
  isError: React.PropTypes.bool,
  messages: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};
