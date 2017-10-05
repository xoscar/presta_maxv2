import React from 'react';

const FloattingButton = ({
  children,
}) => ((
  <div className="fixed-action-btn horizontal" style={{ bottom: '45px', right: '24px' }}>
    <a className="btn-floating btn-large red darken-2">
      <i className="large material-icons">menu</i>
    </a>
    <ul>
      {children}
    </ul>
  </div>
));

FloattingButton.propTypes = {
  children: React.PropTypes.node.isRequired,
};

export default FloattingButton;
