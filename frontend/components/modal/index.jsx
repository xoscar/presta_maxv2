import React from 'react';

const modal = ({
  show,
  id,
  onClosing,
  heading,
  body,
}) => {
  if (show) {
    $(`#${id}`).modal({
      complete: () => {
        onClosing();
      },
    }).modal('open');
  } else {
    $(`#${id}`).modal('close');
  }

  return (
    <div>
      <div className="modal" id={id}>
        <div className="modal-content">
          <div className="col s12">
            {heading}
          </div>
          <div>
            {body}
          </div>
        </div>
      </div>
    </div>
  );
};

modal.propTypes = {
  heading: React.PropTypes.element.isRequired,
  body: React.PropTypes.element.isRequired,
  show: React.PropTypes.bool.isRequired,
  onClosing: React.PropTypes.func.isRequired,
  id: React.PropTypes.string.isRequired,
};

export default modal;
