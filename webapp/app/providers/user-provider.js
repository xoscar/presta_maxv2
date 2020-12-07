import React, { createContext, useReducer, useContext } from 'react';
import PropTypes from 'prop-types';

// models
import User from '../models/user';

const UserContext = createContext();

const reducer = (state = {}, { type, data }) => {
  switch (type) {
    case 'save': return User(data);
    case 'remove': return null;
    default: throw new Error(`Unexpected action: ${type}`);
  }
};

const contextValue = useReducer(reducer, {});

const UserProvider = ({ children }) => {
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.any.isRequired,
  userConfig: PropTypes.object.isRequired,
};

const useUser = () => (
  useContext(UserContext)
);

export {
  useUser,
  UserProvider,
};
