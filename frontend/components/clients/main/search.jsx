import React from 'react';

export default class ClientSearch extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div class="row white z-depth-1" style={{ padding: '10px' }}>
        <form class="search-bar-form" onSubmit = {this.props.onSearch}>
          <div class="col s10">
            <nav class="search red darken-2">
              <div class="nav-wrapper">
                <div class="input-field">
                  <input type="search" placeholder="ID de prestamo, ID de cliente, cantidad o semanas."/>
                  <label for="search"><i class="material-icons">search</i></label><i class="material-icons">close</i>
                </div>
              </div>
            </nav>
          </div>
          <div class="col s2">
            <button class="btn red darken-2 white-text">Buscar</button>
          </div>
        </form>
      </div>
    );
  }
}
