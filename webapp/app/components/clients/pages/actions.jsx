// dependencies
import React from 'react';

// components
import FloattingButton from '../../floattingButton/floattingButton.jsx';
import NewCharge from '../../charges/new.jsx';
import DeleteClient from '../delete.jsx';
import NewLoan from '../../loans/new.jsx';

// <a onClick={this.onOpenModal.bind(this, 'showDeleteClient')} className="btn-floating red darken-1"><i className="material-icons">close</i></a>,

const Actions = ({
  client,
  onRefresh,
}, { router }) => ((
  <FloattingButton>
    <li><DeleteClient onDelete={() => router.push('/clients')} client={client}/></li>
    <li><NewCharge onCreate={onRefresh} client={client}/></li>
    <li><NewLoan onCreate={onRefresh} client={client}/></li>
  </FloattingButton>
));

Actions.propTypes = {
  onRefresh: React.PropTypes.func.isRequired,
  client: React.PropTypes.object.isRequired,
};

Actions.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

export default Actions;

