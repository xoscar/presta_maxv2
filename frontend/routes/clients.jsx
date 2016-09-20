import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

// components
import Main from '../components/clients/main/index.jsx';
import Profile from '../components/clients/profile/index.jsx';

export default class ClientsRoute extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Router history={hashHistory}>
        <Route path='/' component={Main}/>
        <Route path='/clients' component={Main}/>
        <Route path='/clients/:clientId' component={Profile}/>
      </Router>
    );
  }
}
