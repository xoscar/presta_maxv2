import { Component } from 'react';
import { Link } from 'react-router';

export default class ActionsButton extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div class="horizontal" style={{ bottom: '45px', right: '24px' }}>
        <a class="btn-floating btn-large red darken-2">
          <i class="large material-icons">menu</i>
        </a>
        <ul>
          <li><a onClick={this.props.onAction('remove')} class="btn-floating red darken-1"><i class="material-icons">close</i></a></li>
          <li><a onClick={this.props.onAction('show_add_loan')} class="btn-floating blue darken-1"><i class="material-icons">exposure_plus_1</i></a></li>
          <li><a onClick={this.props.onAction('show_add_charge')} class="btn-floating amber darken-4"><i class="material-icons">attach_money</i></a></li>
        </ul>
      </div>
    );
  }
}
