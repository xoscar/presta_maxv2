import React from 'react';

import Row from './row.jsx';

export default class Response extends React.Component {
  constructor() {
    super();
  }

  getResponse() {
    var messages = null;
    var type = this.props.response.type;
    var message = this.props.response.message;

    if (type === 'error')
      messages = JSON.parse(message.responseText).messages.map((msg, index) => {
        return <Row error={true} message={msg.message} key={msg.message + Date.now()} />;
      });
    else if (type === 'success')
      messages = [<Row error={false} message={message} key={message + Date.now()} />];
    return messages;
  }

  render() {
    if (!this.props.response) return null;
    var messages = this.getResponse();
    return (
      <div>
        {messages}
      </div>
    );
  }
}
