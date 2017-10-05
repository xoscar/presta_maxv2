// dependencies
import React from 'react';

// components
import FloattingButton from '../../floattingButton/floattingButton.jsx';
import DeleteLoan from '../delete.jsx';
import NewPayment from '../../payments/new.jsx';

const Actions = ({
  loan,
  onRefresh,
}, { router }) => ((
  <FloattingButton>
    <li><DeleteLoan onDelete={() => router.push('/loans')} loan={loan}/></li>
    <li><NewPayment onCreate={onRefresh} loan={loan}/></li>
  </FloattingButton>
));

Actions.propTypes = {
  onRefresh: React.PropTypes.func.isRequired,
  loan: React.PropTypes.object.isRequired,
};

Actions.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

export default Actions;

