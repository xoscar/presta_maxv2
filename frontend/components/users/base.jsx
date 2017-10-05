// dependencies
import React from 'react';
import Cookies from 'universal-cookie';

// models
import User from '../../models/user.jsx';

// libs
import { getAuth } from '../../utils/auth.jsx';

export default class Base extends React.Component {
  constructor() {
    super();

    this.userService = User({
      headers: getAuth(),
    });

    this.cookieManager = new Cookies();
  }

  handleInputChange(key, event) {
    this.setState({
      [key]: event.target.value,
      error: null,
      response: null,
    });
  }

  render() {
    return null;
  }
}

Base.contextTypes = {
  router: React.PropTypes.object.isRequired,
};
