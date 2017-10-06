// dependencies
import React from 'react';
import { Link } from 'react-router';
import $ from 'jquery';

// libs
import { logout, getUser } from '../../utils/auth.jsx';

export default class Layout extends React.Component {
  componentDidMount() {
    $('.dropdown-button').dropdown();
  }

  render() {
    const location = this.context.router.getCurrentLocation().pathname.split('/')[1];
    const username = getUser().username;

    return (
      <div className="row">
        <div className="col l2 s12">
          <ul id='dropdown1' className='dropdown-content'>
            <li><a>Perfil</a></li>
            <li className="divider"></li>
            <li><a onClick={(event) => {
              event.preventDefault();
              logout(this.context.router);
            }}>Cerrar Sesion</a></li>
          </ul>
          <header>
            <ul id="slide-out" className="side-nav fixed">
              <li className="logo">
                <div className="logo-container">LOGO</div>
              </li>
              <li></li>
              <li className={location === 'clients' && 'active'}><Link to={'clients'}><i className="material-icons">group</i>Clientes</Link></li>
              <li className={location === 'loans' && 'active'}><Link to={'loans/'}><i className="material-icons">thumbs_up_down</i>Prestamos</Link></li>
              <li className="account-options white-text teal lighten-2">
                <div className="row valign-wrapper">
                  <div className="col s2">
                    <img src="http://materializecss.com/images/yuna.jpg" alt="" className="circle responsive-img" />
                  </div>
                  <div className="col s10">
                    <a className="white-text dropdown-button" data-activates='dropdown1'>{username}</a>
                  </div>
                </div>
              </li>
            </ul>
            <ul className="right hide-on-med-and-up">
              <li className={location === 'clients' && 'active'}><Link to={'clients'}>Clienes</Link></li>
              <li className={location === 'loans' && 'active'}><Link to={'loans'}>Prestamos</Link></li>
            </ul>
          </header>
        </div>
        <div className="col l10 s12">
          {this.props.children}
        </div>
      </div>
    );
  }
}

Layout.propTypes = {
  children: React.PropTypes.node.isRequired,
};

Layout.contextTypes = {
  router: React.PropTypes.object.isRequired,
};
