import React from 'react';

const clientSearch = ({ onSearch }) => ((
  <div className="row">
    <div className="col s12 l8 offset-l2">
      <nav>
        <div className="nav-wrapper">
          <form onSubmit = {
              (event) => {
                event.preventDefault();
                onSearch({ term: event.target.querySelector('input').value, page: 0 });
              }
            }>
            <div className="input-field search  white">
              <input id="search" type="search" placeholder="Buscar por id o nombre" onChange= {
                (event) => {
                  onSearch({ term: event.target.value, page: 0 });
                }}/>
              <label className="label-icon" htmlFor="search"><i className="material-icons">search</i></label>
              <i className="material-icons">close</i>
            </div>
          </form>
        </div>
      </nav>
    </div>
  </div>
));

clientSearch.propTypes = {
  onSearch: React.PropTypes.func.isRequired,
};

export default clientSearch;
