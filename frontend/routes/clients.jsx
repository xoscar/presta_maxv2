import React from 'react';
import { Router, Route, hashHistory } from 'react-router';

// components
import Main from '../components/clients/main/index.jsx';
// import Profile from '../components/clients/profile/index.jsx';
// <Route path='/clients/:clientId' component={Profile}/>
const clientsRouter = () => ((
  <Router history={hashHistory}>
    <Route path='/' component={Main}/>
    <Route path='/clients' component={Main}/>
  </Router>
));

export default clientsRouter;
