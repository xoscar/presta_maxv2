// dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import jquery from 'jquery';

// libs
import { validateToken } from './utils/auth.jsx';

// components
import Layout from './components/layout/layout.jsx';
import ClientsHomePage from './components/clients/pages/home.jsx';
import ClientsProfile from './components/clients/pages/profile.jsx';
import Login from './components/users/login.jsx';
import LoansHomePage from './components/loans/pages/home.jsx';
import LoansProfile from './components/loans/pages/profile.jsx';

// css
import './main.scss';

window.$ = window.jQuery = jquery;

require('materialize-css/dist/js/materialize.min.js');

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" onEnter={validateToken('/portal')}/>

    <Route component={Layout}>
      <IndexRoute component={ClientsHomePage}/>
      <Route path="/portal" component={ClientsHomePage} onEnter={validateToken()}/>

      <Route path="/clients" component={ClientsHomePage} onEnter={validateToken()}/>
      <Route path='/clients/:clientId' component={ClientsProfile} onEnter={validateToken()}/>

      <Route path="/loans" component={LoansHomePage} onEnter={validateToken()}/>
      <Route path="/loans/:loanId" component={LoansProfile} onEnter={validateToken()}/>
    </Route>

    <Route path="/login" onEnter={validateToken('/portal')} component={Login} />
  </Router>
, document.getElementById('rootNode'));
