import React from 'react';
import ClassNames from 'classnames';

// components
import LoanSmallCard from '../../loans/small_card.jsx';
import ChargeCard from '../../charges/card.jsx';

export default class Holder extends React.Component {
  constructor() {
    super();
  }

  prepareView() {
    var array = this.props.array;
    var type = this.props.type;

    var fill = array.length > 0 ? array.map((data) => {
      var active = type === 'active_loans'  || type === 'active_charges' ? true : false;

      return type.indexOf('loans') !== -1 ?
        (<LoanSmallCard loan={data} key={data.id} active={active} />) :
        (<ChargeCard charge={data} key={data.id} active={active} />);

    }) : (<p>No hay elementos para mostrar.</p>);

    var textColor = type === 'active_loans' ? 'blue-text' : type === 'active_charges' ? 'yellow-text' : 'green-text';

    return {
      fill,
      textColor,
    };
  }

  render() {
    var data = this.prepareView();
    var depth = this.props.depth;
    var text = this.props.text;
    var icon = this.props.icon;
    var colorClass = ClassNames('material-icons text-darken-2', data.textColor);

    return (
      <li>
        <div class="collapsible-header active">
          <i class={colorClass}>{icon}</i> {text}
          { depth ? <span class="right">Adeudo: ${depth + '.00'}</span> : '' }
        </div>
        <div class="collapsible-body">
          <div class="row">
            {data.fill}
          </div>
        </div>
      </li>
    );
  }
}
