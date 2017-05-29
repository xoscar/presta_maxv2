import React from 'react';

const colllapsibleItem = ({
  heading,
  content,
}) => ((
  <li>
    <div className="collapsible-header active">
      {heading}
    </div>
    <div className="collapsible-body">
      <div className="row">
        {content}
      </div>
    </div>
  </li>
));

colllapsibleItem.propTypes = {
  content: React.PropTypes.element.isRequired,
  heading: React.PropTypes.element.isRequired,
};

export default colllapsibleItem;
