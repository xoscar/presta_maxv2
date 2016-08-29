import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory} from 'react-router';
import ClientRoute from './routes/clients.jsx';

const app = document.getElementById('rootNode');

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path='/' component={ClientRoute}/>
    <Route path='/clients' component={ClientRoute}/>
  </Router>
, app);
