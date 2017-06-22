import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import React from 'react';
import ReactDOM from 'react-dom';

import ClientsRoute from './routes/clients.jsx';
import LoansRoute from './routes/loans.jsx';

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/">
      <IndexRoute component={ClientsRoute.Main}/>
      <Route path="clients" component={ClientsRoute.Main} />
      <Route path='clients/:clientId' component={ClientsRoute.Profile}/>

      <Route path="loans" component={LoansRoute.Main}/>
      <Route path="loans/:loanId" component={LoansRoute.Profile}/>
    </Route>
  </Router>
, document.getElementById('rootNode'));
