import React from 'react';

export default class FloattingButton extends React.Component {
  render() {
    return (
      <div className="fixed-action-btn horizontal" style={{ bottom: '45px', right: '24px' }}>
        <a className="btn-floating btn-large red darken-2">
          <i className="large material-icons">menu</i>
        </a>
        <ul>
          {
            this.props.items.map((item, index) => (
              <li key={index + Date.now()}>{item}</li>
            ))
          }
        </ul>
      </div>
    );
  }
}

FloattingButton.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.element).isRequired,
};
