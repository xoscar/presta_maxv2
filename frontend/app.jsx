// dependencies
import Cookies from 'universal-cookie';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

// routes
import ClientsRoute from './routes/clients.jsx';
import LoansRoute from './routes/loans.jsx';
import UsersRoute from './routes/users.jsx';

const mainLayout = React.createClass({
  render: function render() {
    return (
      <div className="row">
        <div className="col l2 s12">
          <header>
          </header>
        </div>
        <div className ="col l10 s12">
          <main>
            <nav className="top-nav">
              <div className="container">
                <div className="nav-wrapper">
                  <a className="page-title">Clientes</a>
                </div>
              </div>
            </nav>
            <div className="container">
              <p>{this.props.children}</p>
            </div>
          </main>
        </div>
      </div>
    );
  },

  propTypes: {
    children: React.PropTypes.node.isRequired,
  },
});

const validateToken = (nextState, replace) => {
  if (!new Cookies().get('token')) {
    replace({
      pathname: '/login',
    });
  }
};

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" onEnter={(nextState, replace) => {
      replace({
        pathname: !new Cookies().get('token') ? '/login' : '/portal',
      });
    }}/>

    <Route component={mainLayout}>
      <Route path="/portal" onEnter={validateToken}>
        <IndexRoute component={ClientsRoute.Main}/>
        <Route path="clients" component={ClientsRoute.Main} >
          <Route path=':clientId' component={ClientsRoute.Profile}/>
        </Route>

        <Route path="loans" component={LoansRoute.Main} >
          <Route path=":loanId" component={LoansRoute.Profile}/>
        </Route>
      </Route>
    </Route>

    <Route path="/login" onEnter={(nextState, replace) => {
      if (new Cookies().get('token')) {
        replace({
          pathname: '/portal',
        });
      }
    }} component={UsersRoute.Login} />
  </Router>
, document.getElementById('rootNode'));
