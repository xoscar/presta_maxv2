const clients = require('./clients');

$(document).ready(function () {

  var userId = $('#user').val();
  var token = $('#token').val();

  clients.init(userId, token, '#rootNode');
  clients.index(function () {
    console.log('>> clients loaded');
  });

  $('.button-collapse').sideNav();

  $('#clients').click(function (event) {
    event.preventDefault();
    clients.index(function () {
      console.log('FINISHED');
    });
  });
});
