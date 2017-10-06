// dependencies
import React from 'react';

// components
import Input from './input.jsx';
import Response from '../response/index.jsx';

export default class Form extends React.Component {
  constructor(props) {
    super();

    this.state = props.inputs.reduce((acc, input) => (
      Object.assign(acc, {
        [input.field]: input.value,
      })
    ), {
      initial: true,
      response: null,
      errors: {},
    });
  }

  handleInputChange(key, event) {
    this.setState({
      response: null,
      [key]: event.target.value,
      initial: false,
    });
  }

  onClosingModalError() {
    this.setState({ response: null });
  }

  onSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state)

    .then((res) => {
      this.setState({
        response: {
          isError: false,
          success: {
            data: {
              messages: [{
                code: 'success',
                text: this.props.successText,
              }],
              statusCode: res.statusCode,
            },
          },
        },
      });
    })

    .catch((err) => {
      this.setState({
        errors: err.data.messages.reduce((acc, error) => (
          Object.assign(acc, {
            [error.code]: error.text,
          })
        ), {}),
        response: {
          isError: true,
          err,
        },
      });
    });
  }

  render() {
    return (
      <div>
        <Response onClosingModalError={this.onClosingModalError.bind(this)} showMessages={this.props.showMessages} res={this.state.response}/>
        <form className="col s12" onSubmit={this.onSubmit.bind(this)}>
          <div className="row">
          {
            this.props.inputs.map(input => (
              <Input options={input} value={this.state[input.field]} onChange={this.handleInputChange.bind(this, input.field)} error={this.state.errors[input.field]} key={input.field}/>
            ))
          }
          </div>
          {this.props.children}
        </form>
      </div>
    );
  }
}

Form.propTypes = {
  showMessages: React.PropTypes.bool,
  inputs: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  children: React.PropTypes.node,
  successText: React.PropTypes.string,
};
