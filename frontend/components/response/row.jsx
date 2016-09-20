import React from 'react';
import ClassNames from 'classnames';

export default class ResponseRow extends React.Component {
  constructor() {
    super();
  }

  render() {
    var divClass = ClassNames('white-text animated bounceIn red chip', this.props.error ? 'red' : 'green');
    return (
      <div>
        <div class={divClass}> 
          {this.props.message}
          <i class="close material-icons">close</i>
        </div>
        <br />
      </div>
    );
  }
}
