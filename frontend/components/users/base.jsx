// dependencies
import React from 'react';
import Cookies from 'universal-cookie';

// models
import User from '../../models/user.jsx';

export default class Base extends React.Component {
  constructor() {
    super();

    this.userService = User();
    this.cookieManager = new Cookies();
  }

  handleInputChange(key, event) {
    this.setState({
      [key]: event.target.value,
      error: null,
      response: null,
    });
  }

  postLogin(event) {
    event.preventDefault();
    this.userService.login(this.state, (err, user) => {
      if (err) {
        return this.setState({
          error: err,
        });
      }

      // setting token cookie and redirecting
      this.cookieManager.set('token', `token ${user.token}`);
      return this.context.router.push('/portal');
    });
  }

  render() {
    return null;
  }
}

Base.contextTypes = {
  router: React.PropTypes.object.isRequired,
};
