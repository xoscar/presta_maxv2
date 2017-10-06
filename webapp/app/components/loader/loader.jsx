import React from 'react';

const Loader = () => ((
  <div className="container">
    <div className="valign-wrapper" style={{ height: '100%' }}>
      <div className="progress">
        <div className="indeterminate"></div>
      </div>
    </div>
  </div>
));

export default Loader;
