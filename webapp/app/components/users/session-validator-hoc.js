import React from 'react';
import { Redirect } from 'react-router';

// libs
import { isLoggedIn } from '../../utils/auth';

const SessionValidatorHOC = (Wrapped) => {
  const SessionValidator = props => (
    isLoggedIn() ? <Wrapped {...props} ></Wrapped> : <Redirect to="/login"/>
  );

  return SessionValidator;
};

export default SessionValidatorHOC;
