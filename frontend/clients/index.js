const Client = require('./client.js');
const Pagination = require('../pagination/');
const templates = {
  cards: require('!mustache!./cards.hogan'),
  holders: require('!mustache!./holders.hogan'),
  loans: require('!mustache!./loans-modal.hogan'),
};
var searchControl = {
  page: 0,
  term: '',
};
var client = null;
var $rootNode = null;

function showIndex(template, clients) {
  $rootNode.find('.search-wrapper').html('');
  $rootNode.find('.search-wrapper').html(templates[template](clients));
  Pagination.show(searchControl.page, clients.clients.length);
}

function sendSearch(query, callback) {
  client.search(query, function (err, clients) {
    if (err) return console.log(err);
    showIndex('cards', { clients: clients });
    callback(err, clients);
  });
}

module.exports.init = function (user, token, root) {
  var headers = [{
    name: 'user',
    value: user,
  }, {
    name: 'token',
    value: token,
  }, ];
  client = new Client(headers);
  $rootNode = $(root);

  $rootNode.html('');
  $rootNode.html(templates.holders());

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
    client.get($(this).attr('href'), function (err, client) {
      $rootNode.find('.modals').html(templates.loans(client));
      $rootNode.find('.loans-modal').openModal();
    });
  });

  Pagination.setRootNode($rootNode);
  Pagination.listen(function (page) {
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
};

module.exports.index = function (callback) {
  client.getAll(function (err, clients) {
    if (err) return callback(err);
    showIndex('cards', { clients: clients });
    callback();
  });
};
