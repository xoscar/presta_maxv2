import React from 'react';

const responseRow = ({
  backColor,
  message,
}) => ((
  <div>
    <div className={`white-text animated bounceIn red chip ${backColor}`}>
      {message}
      <i className="close material-icons">close</i>
    </div>
  </div>
));

responseRow.propTypes = {
  message: React.PropTypes.string.isRequired,
  backColor: React.PropTypes.string.isRequired,
};

export default responseRow;
