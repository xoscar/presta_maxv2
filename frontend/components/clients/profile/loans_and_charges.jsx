import React from 'react';

import Holder from './holder.jsx';

export default class LoansAndCharges extends React.Component {
  constructor() {
    super();
  }

  prepareView(client) {
    var view = {};

    // loan's holders
    view.active_loans = (<Holder type="active_loans" icon="thumbs_up_down" depth={client.loans_depth} array={client.loans} text="Prestamos activos" key={'active_loans' + Date.now()} />);
    view.finished_loans = (<Holder type={'finished_loans'} icon="thumbs_up_down" array={client.finished_loans} text="Prestamos liquidados" key={'finished_loans' + Date.now()} />);

    // charge's holders
    view.active_charges = (<Holder type="active_charges" icon="attach_money" depth={client.charges_depth} array={client.charges} text="Cargos activos" key={'active_charges' + Date.now()} />);
    view.paid_charges = (<Holder type="paid_charges" icon="attach_money" array={client.paid_charges} text="Cargos liquidados" key={'paid_charges' + Date.now()} />);

    return view;
  }

  componentDidMount() {
    $('.collapsible').collapsible({});
  }

  render() {
    var client = this.props.client;
    var view = this.prepareView(client);

    return (
      <ul class="collapsible popout" data-collapsible="accordion">
        {view.active_loans}
        {view.active_charges}
        {view.finished_loans}
        {view.paid_charges}
      </ul>
    );
  }
}
