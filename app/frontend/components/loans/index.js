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
  add_payment: require('!mustache!./add_payment.hogan'),
  loan_payments: require('!mustache!./payments.hogan'),
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

function showPayments(payments) {
  $rootNode.find('.loan_payments').html(templates.loan_payments({ payments: payments }));
}

function showLoan(loan) {
  $rootNode.html(templates.loan_holder(loan));
  $rootNode.find('.loan_info').html(templates.loan(loan));
  showPayments(loan.payments);
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

    loan.deletePayment(ids[1], ids[0], function (err, payments) {
      if (!err) showPayments(payments);
    });
  });

  $rootNode.on('click', '.payment_update', function (event) {
    event.preventDefault();
    var ids = $(this).attr('href').split('-');
    loan.getPayment(ids[1], ids[0], function (err, payment) {
      $rootNode.find('.update_payment_view').html(templates.update_payment(payment));
      $rootNode.find('.update_payment_modal').openModal();
    });
  });

  $rootNode.on('click', '.remove_loan', function (event) {
    event.preventDefault();
    $rootNode.find('.remove_loan_modal').openModal();
  });

  $rootNode.on('submit', '.remove_loan_form', function (event) {
    event.preventDefault();
    var id = $(this).attr('href');
    loan.delete(id, function (err) {
      if (!err) {
        $rootNode.find('.remove_loan_modal').closeModal();
        return index(console.log);
      }
    });
  });

  $rootNode.on('submit', '.update_payment_form', function (event) {
    event.preventDefault();
    var ids = $(this).attr('href').split('-');
    var data = common.generateFormData($(this).serializeArray());
    loan.updatePayment(ids[1], ids[0], data, function (err, payments) {
      if (!err) {
        $rootNode.find('.update_payment_modal').closeModal();
        return showPayments(payments);
      }

      Response.show('.update_payment_response', err, 'Pago actualizado exitosamente.');
    });
  });

  $rootNode.on('click', '.payment_add', function (event) {
    event.preventDefault();
    var ids = $(this).attr('href').split('-');
    var data = {
      weekly_payment: ids[1],
      loan_id: ids[0],
    };

    $rootNode.find('.add_payment_view').html(templates.add_payment(data));
    $rootNode.find('.add_payment_modal').openModal();
  });

  $rootNode.on('submit', '.add_payment_form', function (event) {
    event.preventDefault();
    var id = $(this).attr('href');
    var data = common.generateFormData($(this).serializeArray());
    loan.createPayment(id, data, function (err, payments) {
      console.log(payments);
      if (!err) showPayments(payments);
      Response.show('.add_payment_response', err, 'Pago creado exitosamente.');
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
  var query = [{
    name: 's',
    value: searchControl.term,
  }, ];
  sendSearch(query, callback);
}

module.exports = {
  init: init,
  index: index,
};
