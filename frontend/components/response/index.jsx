// dependencies
import React from 'react';

// components
import Row from './row.jsx';
import ErrorModal from './errorModal.jsx';

const response = ({
  res = null,
  showMessages = true,
  onClosingModalError,
}) => {
  const result = res && (res.err || res.success);
  return (
    <div>
      <ErrorModal onClosingModalError={onClosingModalError} err={result && result.statusCode >= 500 ? result : null}/>
      {
        result && (showMessages || !res.isError) && result.statusCode < 500 ? result.data.messages.map(message => (
          <Row backColor={res.isError ? 'red' : 'green'} message={message.text} key={`${message.code}-${Date.now()}`}/>
        )) : ''
      }
    </div>
  );
};

response.propTypes = {
  onClosingModalError: React.PropTypes.func.isRequired,

  res: React.PropTypes.object,
  showMessages: React.PropTypes.bool,
};

export default response;
