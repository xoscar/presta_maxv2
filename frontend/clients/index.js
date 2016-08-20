const Client = require('./client');
const Pagination = require('../pagination/');
const common = require('../utils/common');
const Response = require('../response/');
const templates = {
  cards: require('!mustache!./cards.hogan'),
  search: require('!mustache!./search_holders.hogan'),
  loans: require('!mustache!./loans_modal.hogan'),
  client_holder: require('!mustache!./client_holder.hogan'),
  client: require('!mustache!./client.hogan'),
};
var searchControl = {
  page: 0,
  term: '',
};
var client = null;
var $rootNode = null;
var pagination = null;

function showIndex(template, clients) {
  $rootNode.find('.search-wrapper').html('');
  $rootNode.find('.search-wrapper').html(templates[template](clients));
  pagination.show(searchControl.page, clients.clients.length);
}

function sendSearch(query, callback) {
  client.search(query, function (err, clients) {
    if (err) return console.log(err);
    showIndex('cards', { clients: clients });
    callback(err, clients);
  });
}

function showProfile(client) {
  client.loans.forEach(function (loan) {
    loan.text_color = loan.expired ? 'red-text' : 'green-text';
  });

  client.charges.forEach(function (charge) {
    charge.text_color = charge.expired ? 'red-text' : 'green-text';
  });

  $rootNode.html(templates.client_holder());
  $rootNode.find('.client_name').html(client.name_complete + ' ' + client.surname);
  $rootNode.find('.profile').html(templates.client(client));
  $rootNode.find('.collapsible').collapsible({});
}

function init(user, token, root) {
  var headers = [{
    name: 'user',
    value: user,
  }, {
    name: 'token',
    value: token,
  }, ];
  client = new Client(headers);
  $rootNode = $(root);
  pagination = new Pagination($rootNode, 'clients');

  // search listener
  $rootNode.on('submit', '.search-bar-form', function (event) {
    event.preventDefault();
    if (searchControl.term === $(this).find('input').val()) return;
    searchControl.term = $(this).find('input').val();
    searchControl.page = 0;
    var query = [{
      name: 's',
      value: searchControl.term,
    }, ];
    sendSearch(query, function () {
      console.log('>> clients loaded');
    });
  });

  $rootNode.on('click', 'a.modal-trigger', function (event) {
    event.preventDefault();
    client.loans($(this).attr('href'), function (err, client) {
      client.loans.forEach(function (loan) {
        loan.text_color = loan.expired ? 'red-text' : 'green-text';
        loan.payments.forEach(function (payment, index, payments) {
          payment.index = payments.length - index;
        });
      });

      $rootNode.find('.modals').html(templates.loans(client));
      $rootNode.find('.modals .payments ul:first-of-type').removeClass('hide');
      $rootNode.find('.loans-modal').openModal();
    });
  });

  $rootNode.on('submit', '.add_client_form', function (event) {
    event.preventDefault();
    var data = common.generateFormData($(this).serializeArray());
    client.create(data, function (err) {
      if (!err) {
        $rootNode.find('.add-client-modal').closeModal();
        index(console.log);
      }

      Response.show('.add_client_response', err, 'Usuario creado exitosamente.');
    });
  });

  $rootNode.on('click', '.add-client', function () {
    $rootNode.find('.add-client-modal').openModal();
  });

  $rootNode.on('click', '.remove_client', function (event) {
    event.preventDefault();
    $rootNode.find('input[name="client_id"]').val($(this).attr('href'));
    $rootNode.find('.remove_client_modal').openModal();
  });

  $rootNode.on('submit', '.remove_client_form', function (event) {
    event.preventDefault();
    var data = common.generateFormData($(this).serializeArray());
    client.delete(data.client_id, function () {
      $rootNode.find('.remove_client_modal').closeModal();
      $rootNode.html(templates.search());
      index(console.log);
    });
  });

  $rootNode.on('submit', '.update_profile_form', function (event) {
    event.preventDefault();
    var id = $(this).attr('href');
    var data = common.generateFormData($(this).serializeArray());
    client.update(id, data, function (err, client) {
      if (!err) showProfile(client);
      Response.show('.update_response', err, 'Usuario modificado exitosamente.');
    });
  });

  $rootNode.on('click', '.modals .loan', function () {
    var $this = $(this);
    var id = $this.attr('href');
    var color = $this.attr('color').split('-')[0];

    $this.parent().find('.selected').removeClass('selected');
    $this.addClass('selected').find('.card-content').addClass(color === 'red' ? 'expired' : 'not-expired');

    $rootNode.find('.payments ul').addClass('hide');
    $rootNode.find('.payments [name="' + id + '"]').removeClass('hide');
  });

  $rootNode.on('click', '.profile_loans .loan', function () {
    var id = $(this).attr('href');

    $rootNode.find('.profile_loans ul').addClass('hide');
    $rootNode.find('.profile_loans [name="' + id + '"]').removeClass('hide');
  });

  $rootNode.on('click', '.search-wrapper .more, .client_more', function (event) {
    event.preventDefault();
    var id = $(this).attr('href');
    client.get(id, function (err, client) {
      showProfile(client);
    });
  });

  pagination.listen(function (page) {
    searchControl.page = page;
    var query = [{
      name: 'page',
      value: searchControl.page,
    }, {
      name: 's',
      value: searchControl.term,
    }, ];
    client.search(query, function (err, clients) {
      if (err) return console.log(err);
      showIndex('cards', { clients: clients });
    });
  });
}

function index(callback) {
  searchControl = {
    page: 0,
    term: '',
  };
  $rootNode.html(templates.search());
  sendSearch([], callback);
}

module.exports = {
  index: index,
  init: init,
};
