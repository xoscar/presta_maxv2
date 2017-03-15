import React from 'react';
import ClassNames from 'classnames';

// components
import LoanSmallCard from '../../loans/small_card.jsx';
import ChargeCard from '../../charges/card.jsx';

export default class Holder extends React.Component {
  prepareView() {
    const array = this.props.array;
    const type = this.props.type;

    const fill = array.length > 0 ? array.map((data) => {
      const active = type === 'active_loans' || type === 'active_charges';

      return type.indexOf('loans') !== -1 ?
        (<LoanSmallCard loan={data} key={data.id} active={active} />) :
        (<ChargeCard charge={data} key={data.id} active={active} />);
    }) : (<p>No hay elementos para mostrar.</p>);

    return {
      fill,
    };
  }

  render() {
    const data = this.prepareView();
    const depth = this.props.depth;
    const text = this.props.text;
    const icon = this.props.icon;

    const colorClass = ClassNames('material-icons text-darken-2', this.props.textColor);

    return (
      <li>
        <div className="collapsible-header active">
          <i className={colorClass}>{icon}</i> {text}
          { depth ? <span className="right">Adeudo: ${depth + '.00'}</span> : '' }
        </div>
        <div className="collapsible-body">
          <div className="row">
            {data.fill}
          </div>
        </div>
      </li>
    );
  }
}

Holder.propTypes = {
  type: React.PropTypes.string,
  array: React.PropTypes.array,
  depth: React.PropTypes.string,
  text: React.PropTypes.string,
  icon: React.PropTypes.icon,
  textColor: React.PropTypes.string,
};
