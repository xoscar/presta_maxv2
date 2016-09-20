import React from 'react';

import ClientActions from '../../../actions/client.jsx';

export default class ClientHeading extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div class="row white z-depth-1">
        <div class="col s12">
          <div style={{ marginTop: '2%' }} class="col s12 red-text text-darken-2">
            <div class="row">
              <h4 class="col s10"> Clientes </h4>
              <div class="col s2">
                <button onClick={ClientActions.showNewClient} class="add-client right btn waves-effect" style={{ marginTop: '20px' }}>
                  Nuevo
                  <i class="material-icons right">account_box</i> 
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
