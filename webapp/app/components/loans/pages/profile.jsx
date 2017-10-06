// dependencies
import React from 'react';
import { Link } from 'react-router';

// components
import LoanBase, { Information } from '../base.jsx';
import { PaymentCard } from '../../payments/base.jsx';

import Response from '../../response/index.jsx';
import Update from '../update.jsx';
import Heading from '../../heading/heading.jsx';
import Actions from './actions.jsx';

export default class Profile extends LoanBase {
  constructor() {
    super();

    this.state = {
      response: null,
      loan: null,
    };
  }

  componentDidMount() {
    this.onRefresh();
  }

  onRefresh(updatedLoan) {
    return updatedLoan ? this.setState({
      loan: updatedLoan,
    }) : this.loanService.get(this.props.params.loanId)

    .then(loan => (
      this.setState({
        loan: loan.data,
        response: {
          isError: false,
          success: {
            data: {
              messages: [],
            },
            statusCode: loan.statusCode,
          },
        },
      })
    ))

    .catch(err => (
      this.setState({
        response: {
          isError: true,
          err,
        },
      })
    ));
  }

  render() {
    return !this.state.loan ? <h1>Cargando...</h1> :
    (
      <div>
        <Actions loan={this.state.loan} onRefresh={this.onRefresh.bind(this)}/>
        <Heading title={this.state.loan.client.name_complete}>
          <Link className="teal darken-2 btn-large btn-floating waves-effect waves-light" to={`clients/${this.state.loan.client_id}`}><i className="material-icons">person</i></Link>
        </Heading>
        <div className="container animated fadeIn">
          <div className="col s12">
            <div className="row">
              <div className="col s8 center-align" >
                <Response res={this.state.response} showMessages={false} onClosingModalError={() => {}}/>
              </div>
              <div className="row">
                <div className="col l8 s12">
                  <Update loan={this.state.loan} onUpdate={this.onRefresh.bind(this)}/>
                </div>
                <div className="col l4 s12">
                  <Information loan={this.state.loan}/>
                </div>
              </div>
              <div className="row">
                <div className="col s12">
                  {
                    this.state.loan.payments.length !== 0 ? (
                      <div>
                        <div>
                          <h5>Pagos</h5>
                        </div>
                        <div className="row animated fadeIn">
                          {
                            this.state.loan.payments.map((payment, index) => (
                              <PaymentCard payment={payment} key={payment.id} number={index + 1} loan={this.state.loan} onRefresh={this.onRefresh.bind(this)}/>
                            ))
                          }
                        </div>
                      </div>
                    ) : (
                      <h5>No se han realizado pagos.</h5>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Profile.propTypes = {
  params: React.PropTypes.object.isRequired,
};
