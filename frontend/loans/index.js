const Loan = require('./loan');
const common = require('../utils/common');
const Response = require('../response/');
const Pagination = require('../pagination/');
const templates = {
  add_loan: require('!mustache!./add_loan.hogan'),
  search: require('!mustache!./search_holders.hogan'),
  cards: require('!mustache!./cards.hogan'),
  loan_holder: require('!mustache!./loan_holder.hogan'),
  loan: require('!mustache!./loan.hogan'),
  update_payment: require('!mustache!./update_payment.hogan'),
  loan_payments: require('!mustache!./loan_payments.hogan'),
};

var loan = null;
var $rootNode = null;

var searchControl = {
  page: 0,
  term: '',
};

var pagination = null;

function showIndex(template, loans) {
  $rootNode.html('');
  $rootNode.html(templates.search());
  $rootNode.find('.search-wrapper-loans').html('');
  $rootNode.find('.search-wrapper-loans').html(templates[template](loans));
  pagination.show(searchControl.page, loans.loans.length);
}

function sendSearch(query, callback) {
  loan.search(query, function (err, loans) {
    if (err) return console.log(err);
    showIndex('cards', { loans: loans });
    callback(err, loans);
  });
}

function showLoan(loan) {
  $rootNode.html(templates.loan_holder());
  $rootNode.find('.loan_info').html(templates.loan(loan));
  $('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 15,
  });
}

function init(user, token, root) {
  var headers = [{
    name: 'user',
    value: user,
  }, {
    name: 'token',
    value: token,
  }, ];
  loan = new Loan(headers);
  $rootNode = $(root);
  Response.setRootNode($rootNode);

  // search listener
  $rootNode.on('submit', '.search-loans-form', function (event) {
    event.preventDefault();
    if (searchControl.term === $(this).find('input').val()) return;
    searchControl.term = $(this).find('input').val();
    searchControl.page = 0;
    var query = [{
      name: 's',
      value: searchControl.term,
    }, ];
    sendSearch(query, function () {});
  });

  $rootNode.on('click', '.loan_more', function (event) {
    event.preventDefault();
    var id = $(this).attr('href');
    loan.get(id, function (err, loan) {
      showLoan(loan);
    });
  });

  $rootNode.on('click', '.add_loan', function (event) {
    event.preventDefault();
    var clientId = $(this).attr('href');
    $rootNode.find('.add_loan_view').html(templates.add_loan({ client_id: clientId }));
    $rootNode.find('.add_loan_modal').openModal();
  });

  $rootNode.on('submit', '.update_loan_form', function (event) {
    event.preventDefault();
    var id = $(this).attr('href');
    var data = common.generateFormData($(this).serializeArray());

    loan.update(id, data, function (err, loan) {
      if (!err) showLoan(loan);
      Response.show('.update_loan_response', err, 'Prestamo actualizado correctamente.');
    });
  });

  $rootNode.on('click', '.payment_delete', function (event) {
    event.preventDefault();
    var $this = $(this);
    var ids = $this.attr('href').split('-');

    loan.deletePayment(ids[1], ids[0], function (err) {
      if (!err) $this.parent().parent().fadeOut();
    });
  });

  $rootNode.on('click', '.payment_update', function (event) {
    event.preventDefault();
    var ids = $(this).attr('href').split('-');
    loan.getPayment(ids[1], ids[0], function (err, payment) {
      console.log(err, payment);
      $rootNode.find('.update_payment_view').html(templates.update_payment(payment));
      $rootNode.find('.update_payment_modal').openModal();
    });
  });

  $rootNode.on('submit', '.update_payment_form', function (event) {
    event.preventDefault();
    var ids = $(this).attr('href').split('-');
    loan.updatePayment(ids[1], ids[0], function (err, payment) {

    });
  });

  $rootNode.on('submit', '.add_loan_form', function (event) {
    event.preventDefault();
    var $this = $(this);
    var data = common.generateFormData($this.serializeArray());
    loan.create(data, function (err) {
      if (!err) $this[0].reset();
      Response.show('.add_loan_response', err, 'Prestamo creado exitosamente.');
    });
  });

  pagination = new Pagination($rootNode, 'loans');
  pagination.listen(function (page) {
    searchControl.page = page;
    var query = [{
      name: 'page',
      value: searchControl.page,
    }, {
      name: 's',
      value: searchControl.term,
    }, ];
    loan.search(query, function (err, loans) {
      if (err) return console.log(err);
      showIndex('cards', { loans: loans });
    });
  });
}

function index(callback) {
  sendSearch([], callback);
}

module.exports = {
  init: init,
  index: index,
};
