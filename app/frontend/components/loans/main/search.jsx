import React from 'react';

const clientSearch = ({ onSearch }) => ((
  <div className="row white z-depth-1" style={{ padding: '10px' }}>
    <form className="search-bar-form" onSubmit = {
      (event) => {
        event.preventDefault();
        onSearch(event.target.querySelector('input').value, 0);
      }
    }>
      <div className="col s10">
        <nav className="search red darken-2">
          <div className="nav-wrapper">
            <div className="input-field">
              <input type="search" placeholder="ID de prestamo, ID de cliente, cantidad o semanas."/>
              <label htmlFor="search"><i className="material-icons">search</i></label><i className="material-icons">close</i>
            </div>
          </div>
        </nav>
      </div>
      <div className="col s2">
        <button className="btn red darken-2 white-text">Buscar</button>
      </div>
    </form>
  </div>
));

clientSearch.propTypes = {
  onSearch: React.PropTypes.func.isRequired,
};

export default clientSearch;
