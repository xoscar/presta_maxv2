import React from 'react';

const clientHeading = ({ showClientModal }) => ((
  <div className="row white z-depth-1">
    <div className="col s12">
      <div style={{ marginTop: '2%' }} className="col s12 red-text text-darken-2">
        <div className="row">
          <h4 className="col s10"> Clientes </h4>
          <div className="col s2">
            <button onClick={() => showClientModal(true)} className="add-client right btn waves-effect" style={{ marginTop: '20px' }}>
              Nuevo
              <i className="material-icons right">account_box</i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
));

clientHeading.propTypes = {
  showClientModal: React.PropTypes.func.isRequired,
};

export default clientHeading;
