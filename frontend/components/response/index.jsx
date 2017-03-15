import React from 'react';
import Row from './row.jsx';

const response = ({
  isError,
  messages,
}) => ((
  <div>
    {
      messages.map(message => (
        <Row backColor={isError ? 'red' : 'green'} message={message.message} key={`${message.field}-${Date.now()}`} />
      ))
    }
  </div>
));

response.propTypes = {
  isError: React.PropTypes.bool,
  messages: React.PropTypes.arrayOf(React.PropTypes.object),
};

export default response;
