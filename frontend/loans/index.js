const Loan = require('./loan.js');
const templates = {
  payments: require('!mustache!./payments.hogan'),
};

var loans = null;
var $rootNode = null;

module.exports.init = function (user, token, root) {
  var headers = [{
    name: 'user',
    value: user,
  }, {
    name: 'token',
    value: token,
  }, ];
  loans = new Loan(headers);
  $rootNode = $(root);

  $rootNode.on('click', '.loan', function () {
    var id = $(this).attr('href');
    var $holder = $rootNode.find('.payments');
    loans.get(id, function (err, loan) {
      $holder.html(templates.payments(loan));
    });
  });
};
