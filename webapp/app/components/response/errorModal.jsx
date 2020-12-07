// dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-materialize';
import $ from 'jquery';

// components
import Row from './row.jsx';

export default class ErrorModal extends React.Component {
  constructor(props) {
    super();

    this.state = {
      err: props.err,
    };
  }

  componentWillReceiveProps(props) {
    this.setState(props);
  }

  openModal() {
    $('#error-modal').modal('open');
    $('#error-modal').css('zIndex', '2000');
    const length = $('.modal-overlay').length;

    if (length) {
      $('.modal-overlay')[1].style.zIndex = '0';
      $('.modal-overlay')[1].style.opacity = '0';
    }
  }

  render() {
    if (this.state.err) {
      this.openModal();
    }

    return (
      <Modal

      modalOptions={{
        complete: () => {
          this.setState({
            err: null,
          });
          this.props.onClosingModalError();
        },
      }}

      id='error-modal'

      header='Notificacion de error.'

      actions={
        <div>
          <a className="modal-action modal-close waves-effect waves-green btn-flat">Continuar</a>
        </div>
      }>
        <p>Error ocurrido durante la ejecución.</p>
        <div className="center-align">
          {
            this.state.err && this.state.err.data.messages ? this.state.err.data.messages.map((message, i) => (
              <div className="row" key={`${message.code}-${i}-${Date.now()}`}>
                <label>{message.text}</label>
              </div>
            )) : <p>{this.state.err ? this.state.err.data : ''}</p>
          }
        </div>
      </Modal>
    );
  }
}

ErrorModal.propTypes = {
  onClosingModalError: PropTypes.func.isRequired,
  err: PropTypes.object,
};

