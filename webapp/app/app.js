// dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { createBrowserHistory } from 'history';
import jquery from 'jquery';

// components
// import Layout from './components/layout/layout.jsx';
// import ClientsHomePage from './components/clients/pages/home.jsx';
// import ClientsProfile from './components/clients/pages/profile.jsx';
// import LoansHomePage from './components/loans/pages/home.jsx';
// import LoansProfile from './components/loans/pages/profile.jsx';
import Login from './components/users/login';

// css
import './main.scss';
import { UserProvider } from './providers/user-provider';

window.$ = window.jQuery = jquery;

require('materialize-css/dist/js/materialize.min.js');

// static
const customHistory = createBrowserHistory();

ReactDOM.render(
  <UserProvider>
    <Router history={customHistory}>
      {/* <Route path="/" component={ClientsHomePage} /> */}
      {/* <Route component={Layout}>
        <IndexRoute component={ClientsHomePage}/>

        <Route path="/clients" component={ClientsHomePage} onEnter={validateToken()}/>
        <Route path='/clients/:clientId' component={ClientsProfile} onEnter={validateToken()}/>

        <Route path="/loans" component={LoansHomePage} onEnter={validateToken()}/>
        <Route path="/loans/:loanId" component={LoansProfile} onEnter={validateToken()}/>
      </Route> */}

      <Route path="/login" component={Login} />
    </Router>
  </UserProvider>
, document.getElementById('rootNode'));
