import React from 'react';
import PropTypes from 'prop-types';

const responseRow = ({
  backColor,
  message,
}) => ((
  <div>
    <div className={`white-text chip ${backColor}`}>
      {message}
      <i className="close material-icons">close</i>
    </div>
  </div>
));

responseRow.propTypes = {
  message: PropTypes.string.isRequired,
  backColor: PropTypes.string.isRequired,
};

export default responseRow;
