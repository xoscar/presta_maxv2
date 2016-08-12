const clients = require('./clients');
const loans = require('./loans');
const charges = require('./charges');

$(document).ready(function () {

  var userId = $('#user').val();
  var token = $('#token').val();

  clients.init(userId, token, '#rootNode');
  loans.init(userId, token, '#rootNode');
  charges.init(userId, token, '#rootNode');
  clients.index(function () {});

  $('.button-collapse').sideNav();

  $('#clients').click(function (event) {
    event.preventDefault();
    clients.index(function () {});
    $(this).parent().find('a').removeClass('active');
    $(this).addClass('active');
  });

  $('#loans').click(function (event) {
    event.preventDefault();
    loans.index(function () {});
    $(this).parent().find('a').removeClass('active');
    $(this).addClass('active');
  });
});
