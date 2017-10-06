// dependencies
import React from 'react';

// components
import { ChargeCard } from '../../charges/base.jsx';
import { LoanSmallCard } from '../../loans/base.jsx';
import ClientBase, { Information } from '../base.jsx';
import Collapsible, { ColllapsibleItem } from '../../collapsible/collapsible.jsx';

import Response from '../../response/index.jsx';
import Update from '../update.jsx';
import Heading from '../../heading/heading.jsx';
import Actions from './actions.jsx';
import Loader from '../../loader/loader.jsx';

export default class Profile extends ClientBase {
  constructor() {
    super();

    this.state = {
      response: null,
      client: null,
    };
  }

  componentDidMount() {
    this.onRefresh();
  }

  onRefresh(updatedClient) {
    return updatedClient ? this.setState({
      client: updatedClient,
    }) : this.clientService.get(this.props.params.clientId)

    .then(client => (
      this.setState({
        client: client.data,
        response: {
          isError: false,
          success: {
            data: {
              messages: [],
            },
            statusCode: client.statusCode,
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
    return !this.state.client ? <Loader/> :
    (
      <div>
        <Actions client={this.state.client} onRefresh={this.onRefresh.bind(this)}/>
        <Heading title={this.state.client.name_complete}>
        </Heading>
        <div className="container animated fadeIn">
          <div className="col s12">
            <div className="row">
              <div className="col s8 center-align" >
                <Response res={this.state.response} showMessages={false} onClosingModalError={() => {}}/>
              </div>
              <div className="row">
                <div className="col l8 s12">
                  <Update client={this.state.client} onUpdate={this.onRefresh.bind(this)}/>
                </div>
                <div className="col l4 s12">
                  <Information client={this.state.client}/>
                </div>
              </div>
              <div className="row">
                <div className="col s12">
                  <Collapsible>
                    <ColllapsibleItem heading={
                        <div className="col s12">
                          <i className="material-icons text-darken-2 blue-text">thumbs_up_down</i>
                          Prestamos activos
                          <span className="right">Adeudo: ${+this.state.client.loans_depth.toFixed(2)}</span>
                        </div>
                      }>
                      <div>{
                        this.state.client.loans.length ? this.state.client.loans.map(loan => (
                          <LoanSmallCard onRefresh={this.onRefresh.bind(this)} loan={loan} key={loan.id}/>
                        )) : <p>No prestamos activos para mostrar.</p>
                      }</div>
                    </ColllapsibleItem>
                    <ColllapsibleItem heading={
                      <div className="col s12">
                        <i className="material-icons text-darken-2 yellow-text">attach_money</i>
                        Cargos activos
                        <span className="right">Adeudo: ${+this.state.client.charges_depth.toFixed(2)}</span>
                      </div>
                    }>
                      <div>{
                        this.state.client.charges.length ? this.state.client.charges.map(charge => (
                          <ChargeCard onRefresh={this.onRefresh.bind(this)} charge={charge} key={charge.id} />
                        )) : <p>No cargos activos para mostrar.</p>
                      }</div>
                    </ColllapsibleItem>
                    <ColllapsibleItem heading={
                      <div>
                        <i className="material-icons text-darken-2 green-text">thumbs_up_down</i>
                        Prestamos liquidados
                      </div>
                    }>
                      <div>{
                        this.state.client.finished_loans.length ? this.state.client.finished_loans.map(loan => (
                          <LoanSmallCard loan={loan} onRefresh={this.onRefresh.bind(this)} key={loan.id}/>
                        )) : <p>No prestamos liquidados para mostrar.</p>
                      }</div>
                    </ColllapsibleItem>
                    <ColllapsibleItem heading={
                      <div>
                        <i className="material-icons text-darken-2 green-text">attach_money</i>
                        Cargos liquidados
                      </div>}
                      >
                        <div>{
                          this.state.client.paid_charges.length ? this.state.client.paid_charges.map(charge => (
                            <ChargeCard charge={charge} onRefresh={this.onRefresh.bind(this)} key={charge.id}/>
                          )) : <p>No cargos liquidados para mostrar.</p>
                        }</div>
                    </ColllapsibleItem>
                  </Collapsible>
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
