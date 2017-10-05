// dependencies
import React from 'react';

const Heading = ({
  title = '',
  children = '',
}) => ((
  <nav className="top-nav teal lighten-2 row" style={{ marginBottom: '8rem' }}>
    <div className="container">
      <div className="nav-wrapper">
        <div className="col s2 hide-on-large-only">
        </div>
        <div className="col s6 m6 l10">
          <a className="page-title capitalize">{title}</a>
        </div>
        <div className="col s4 m2 l2" style={{ marginTop: '3.5%' }}>
          {children}
        </div>
      </div>
    </div>
  </nav>
));

Heading.propTypes = {
  title: React.PropTypes.string.isRequired,
  children: React.PropTypes.node,
};

export default Heading;
