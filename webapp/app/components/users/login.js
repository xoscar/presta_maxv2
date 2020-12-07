// dependencies
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// components
import Response from '../response/index.jsx';

import { login } from '../../utils/auth';

// hooks
import { useInputHandler, useHandleSubmit } from '../../hooks/handlers';
import { useUser } from '../../providers/user-provider';

const Login = ({ User, history }) => {
  const [{ username, password }, inputHandler] = useInputHandler({ username: '', password: '' });
  const [response, setResponse] = useState({});
  const [, handleSubmit] = useHandleSubmit();
  const [, dispatchUser] = useUser();

  const postLogin = async () => {
    try {
      const userData = await User.login({ username, password });
      login({ user: userData });
      dispatchUser({ type: 'save', data: userData });
      history.push('/');
    } catch (err) {
      setResponse({
        err,
      });
    }
  };

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
            <Response res={response} onClosingModalError={() => {}}/>
          </div>
          <div className="row">
            <form onSubmit={() => handleSubmit(postLogin)} className="col s12 m6 offset-m3">
              <div className="row">
                <div className="input-field col s12"><i className="material-icons prefix">account_circle</i>
                  <input id="first_name" name="username" type="text" value={username} onChange={event => inputHandler('username', event)} className="validate"/>
                  <label htmlFor="first_name">Username</label>
                </div>
              </div>
              <div className="row">
                <div className="input-field col s12"><i className="material-icons prefix">https</i>
                  <input id="first_name" name="password" type="password" className="validate" value={password} onChange={event => useInputHandler('password', event)}/>
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
};

Login.propTypes = {
  User: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default Login;
