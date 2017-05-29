import React from 'react';

import Item from './item.jsx';

export default class Collapsible extends React.Component {
  componentDidMount() {
    $('.collapsible').collapsible({});
  }

  render() {
    return (
      <ul className="collapsible popout" data-collapsible="accordion">
        {
          this.props.items.map((item, index) => (
            <Item heading={item.heading} content={item.content} key={index + Date.now()} />
          ))
        }
      </ul>
    );
  }
}

Collapsible.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};
