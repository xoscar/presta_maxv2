import React from 'react';

export default class Collapsible extends React.Component {
  componentDidMount() {
    $('.collapsible').collapsible({});
  }

  render() {
    return (
      <ul className="collapsible popout" data-collapsible="accordion">
        {this.props.children}
      </ul>
    );
  }
}

Collapsible.propTypes = {
  children: React.PropTypes.node.isRequired,
};

export const ColllapsibleItem = ({
  children,
  heading,
}) => ((
  <li>
    <div className="collapsible-header active">
      {heading}
    </div>
    <div className="collapsible-body">
      <div className="row">
        {children}
      </div>
    </div>
  </li>
));

ColllapsibleItem.propTypes = {
  children: React.PropTypes.element.isRequired,
  heading: React.PropTypes.element.isRequired,
};
