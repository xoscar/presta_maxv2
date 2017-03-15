import React from 'react';

export default class Pagination extends React.Component {
  constructor() {
    super();
    this.state = {
      page: 0,
    };
  }

  paginationChange(event) {
    event.preventDefault();
    const value = Number(event.target.getAttribute('name'));
    this.setState({
      page: value,
    });

    this.props.onClick(value);
  }

  render() {
    const current = this.props.page;
    const prev = current < 0 ? null : current - 1;
    const next = this.props.results === 0 || this.props.results < 12 ? null : current + 1;

    return (
      <div className="row center-align z-depth-1">
        <div className="col s12 pagination-clients">
          <ul className="pagination">
            {
              prev >= 0 ?
                <li className="waves-effect previous"><a name={prev} onClick={this.paginationChange.bind(this)} ><i name={prev} className="material-icons">chevron_left</i></a></li> :
                <li className="disabled"><a><i className="material-icons">chevron_left</i></a></li>
            }

            { prev >= 0 ? <li className="waves-effect number"><a name={prev} onClick={this.paginationChange.bind(this)}>{prev + 1}</a></li> : '' }

            <li className="active number"><a name={current}>{current + 1}</a></li>

            { next ? <li className="waves-effect number"><a name={next} onClick={this.paginationChange.bind(this)}>{next + 1}</a></li> : '' }

            {
              next ?
                <li className="waves-effect next"><a name={next} onClick={this.paginationChange.bind(this)}><i name={next} className="material-icons">chevron_right</i></a></li> :
                <li className="disabled"><a><i className="material-icons">chevron_right</i></a></li>
            }
          </ul>
        </div>
      </div>
    );
  }
}

Pagination.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  results: React.PropTypes.number,
  page: React.PropTypes.number,
};
