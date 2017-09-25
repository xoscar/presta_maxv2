// dependencies
import React from 'react';

// components
import UserBase from './base.jsx';
import Response from '../response/index.jsx';

export default class Login extends UserBase {
  constructor() {
    super();

    this.state = {
      username: '',
      password: '',
      error: null,
    };
  }

  render() {
    return (
    <div className="container">
      <div className="row">
        <div className="col s10 offset-s1 z-depth-1">
          <div className="row">
            <div className="col s12 m12 center-align white-text red darken-2">
              <h3>Presta Max</h3>
            </div>
          </div>
          <div className="row  center-align">
            { this.state.error ? <Response isError={true} messages={this.state.error} /> : '' }
          </div>
          <div className="row">
            <form onSubmit={this.postLogin.bind(this)} className="col s12 m6 offset-m3">
              <div className="row">
                <div className="input-field col s12"><i className="material-icons prefix">account_circle</i>
                  <input id="first_name" name="username" type="text" value={this.state.username} onChange={this.handleInputChange.bind(this, 'username')} className="validate"/>
                  <label htmlFor="first_name">Username</label>
                </div>
              </div>
              <div className="row">
                <div className="input-field col s12"><i className="material-icons prefix">https</i>
                  <input id="first_name" name="password" type="password" className="validate" value={this.state.password} onChange={this.handleInputChange.bind(this, 'password')}/>
                  <label htmlFor="first_name">Password</label>
                </div>
              </div>
              <div className="row right-align">
                <div className="col s12">
                  <button className="btn waves-effect waves-light"><i className="material-icons prefix">input</i></button>
                </div>
              </div>
            </form>
          </div>
          <div className="row">
            <div className="col s11 right-align grey-text text-darken-1">© 2016 - 2017 PrestaMax </div>
          </div>
        </div>
      </div>
    </div>
    );
  }
}
