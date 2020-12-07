// dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-materialize';

// components
import Response from '../response/index.jsx';
import Input from './input.jsx';

export default class ModalForm extends React.Component {
  constructor(props) {
    super();

    this.state = this.initialState = props.inputs.reduce((acc, input) => (
      Object.assign(acc, {
        [input.field]: input.value,
      })
    ), {
      initial: true,
      response: null,
      errors: {},
    });
  }

  onClosingModal() {
    this.setState(Object.assign(this.props.keepForm ? {} : this.initialState, {
      response: null,
      errors: {},
    }));

    return this.props.onClosingModal && this.props.onClosingModal();
  }

  handleInputChange(key, event) {
    this.setState({
      response: null,
      [key]: event.target.value,
      initial: false,
    });
  }

  onSubmit() {
    this.props.onSubmit(this.state)

    .then((res) => {
      this.setState(Object.assign(this.props.keepForm ? {} : this.initialState, {
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
      }));
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

  onClosingModalError() {
    this.setState({ response: null });
  }

  render() {
    return (
      <Modal

      modalOptions={{
        complete: () => {
          this.onClosingModal();
        },
      }}

      header={this.props.header}

      actions={
        <div>
          <a className="modal-action modal-close waves-effect waves-light grey-text btn-flat">Cerrar</a>
          <a className={`waves-effect ${this.props.closeModal ? 'modal-close' : ''} waves-green btn-flat green-text`} onClick={this.onSubmit.bind(this)}>{this.props.acceptText}</a>
        </div>
      }

      trigger= {this.props.trigger}
      >
        <div className="center-align">
          <Response onClosingModalError={this.onClosingModalError.bind(this)} showMessages={this.props.showMessages} res={this.state.response}/>
        </div>
        <form className="col s12">
          <div className="row">
          {
            this.props.inputs.map(input => (
              <Input options={input} value={this.state[input.field]} onChange={this.handleInputChange.bind(this, input.field)} error={this.state.errors[input.field]} key={input.field}/>
            ))
          }
          </div>
          <div className="row">
            {this.props.children || ''}
          </div>
        </form>
      </Modal>
    );
  }
}

ModalForm.propTypes = {
  acceptText: PropTypes.string,
  successText: PropTypes.string,
  header: PropTypes.string,
  closeModal: PropTypes.bool,
  keepForm: PropTypes.bool,

  trigger: PropTypes.node,
  inputs: PropTypes.arrayOf(PropTypes.object).isRequired,

  onClosingModal: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  showMessages: PropTypes.bool,
  children: PropTypes.node,
};
