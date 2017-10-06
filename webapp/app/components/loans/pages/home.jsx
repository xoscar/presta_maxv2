// dependencies
import React from 'react';

// components
import Pagination from '../../pagination/index.jsx';
import LoanBase, { Card } from '../base.jsx';
import Response from '../../response/index.jsx';
import Heading from '../../heading/heading.jsx';
// import NewLoan from '../new.jsx';

// fragments
import Search from '../../search/search.jsx';

export default class LoansHomePage extends LoanBase {
  constructor() {
    super();

    this.state = {
      term: '',
      page: 0,
      loans: null,
      response: null,
    };
  }

  componentDidMount() {
    this.search({ term: '', page: 0 });
  }

  paginationChange(page) {
    this.search({ term: this.state.term, page });
  }

  search({ term, page }) {
    this.loanService.search({ s: term, page })

    .then((result) => {
      const { loans } = result.data;

      this.setState({
        term,
        page,
        loans,
        response: {
          isError: false,
          success: {
            data: {
              messages: [{
                code: 'success',
                text: 'Prestamos encontrados.',
              }],
            },
            statusCode: result.statusCode,
          },
        },
      });
    })

    .catch((err) => {
      this.setState({
        response: {
          isError: true,
          err,
        },
      });
    });
  }

  // <NewLoan onCreate={this.search.bind(this, { term: '', page: 0 })}/>

  render() {
    return !this.state.loans ? (<h1>Cargando...</h1>) :
    (
      <div>
        <Heading title='Prestamos'>
        </Heading>
        <div className="container">
          <Search onSearch={this.search.bind(this)} />
          { this.state.response && this.state.response.statusCode >= 400 ? <Response isError={this.state.response.isError} err={this.state.response.err} success={this.state.response.success} /> : '' }
          <div className="row animated fadeIn">
            {this.state.loans.map(loan => (
              <Card loan={loan} key={loan.id}/>
            ))}
          </div>
          <Pagination page={this.state.page} onClick={this.paginationChange.bind(this)} results={this.state.loans.length}/>
        </div>
      </div>
    );
  }
}
