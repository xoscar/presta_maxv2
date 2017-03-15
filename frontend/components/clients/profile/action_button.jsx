import React from 'react';

export default class ActionsButton extends React.Component {
  onClickedLink(type, event) {
    this.props.onAction(type, event);
  }

  render() {
    return (
      <div className="fixed-action-btn horizontal" style={{ bottom: '45px', right: '24px' }}>
        <a className="btn-floating btn-large red darken-2">
          <i className="large material-icons">menu</i>
        </a>
        <ul>
          <li><a onClick={this.onClickedLink.bind(this, 'remove')} className="btn-floating red darken-1"><i className="material-icons">close</i></a></li>
          <li><a onClick={this.onClickedLink.bind(this, 'show_add_loan')} className="btn-floating blue darken-1"><i className="material-icons">exposure_plus_1</i></a></li>
          <li><a onClick={this.onClickedLink.bind(this, 'show_add_charge')} className="btn-floating amber darken-4"><i className="material-icons">attach_money</i></a></li>
        </ul>
      </div>
    );
  }
}

ActionsButton.propTypes = {
  onAction: React.PropTypes.function,
};
