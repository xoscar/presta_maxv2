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
    var value = Number(event.target.getAttribute('name'));
    this.state.page = value;
    this.props.onClick(value);
  }

  render() {
    var current = this.state.page;
    var prev = current < 0 ? null : current - 1;
    var next =  this.props.results === 0 || this.props.results < 12 ? null : current + 1;

    console.log(current, prev);
    return (
      <div class ="row center-align z-depth-1">
        <div class="col s12 pagination-clients">
          <ul class="pagination">
            {
              prev >= 0 ?
                <li class="waves-effect previous"><a name={prev} onClick={this.paginationChange.bind(this)} ><i name={prev} class="material-icons">chevron_left</i></a></li>
              :
                <li class="disabled"><a><i class="material-icons">chevron_left</i></a></li>
            }

            {
              prev >= 0 ?
                <li class="waves-effect number"><a name={prev} onClick={this.paginationChange.bind(this)}>{prev + 1}</a></li>
              : ''
            }

            <li class="active number"><a name={current}>{current + 1}</a></li>

            {
              next ?
                <li class="waves-effect number"><a name={next} onClick={this.paginationChange.bind(this)}>{next + 1}</a></li> : ''
            }

            {
              next ?
                <li class="waves-effect next"><a name={next} onClick={this.paginationChange.bind(this)}><i name={next} class="material-icons">chevron_right</i></a></li>
              :
                <li class="disabled"><a><i class="material-icons">chevron_right</i></a></li>
            }
          </ul>
        </div>
      </div>
    );
  }
}
