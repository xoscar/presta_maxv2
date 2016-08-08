const Loan = require('./loan');
const common = require('../utils/common');
const Response = require('../response/');
const templates = {
  add_loan: require('!mustache!./add_loan.hogan'),
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
  Response.setRootNode($rootNode);

  $rootNode.on('click', '.add_loan', function (event) {
    event.preventDefault();
    var clientId = $(this).attr('href');
    $rootNode.find('.add_loan_view').html(templates.add_loan({ client_id: clientId }));
    $rootNode.find('.add_loan_modal').openModal();
  });

  $rootNode.on('submit', '.add_loan_form', function (event) {
    event.preventDefault();
    var $this = $(this);
    var data = common.generateFormData($this.serializeArray());
    loans.create(data, function (err) {
      if (!err) $this[0].reset();
      Response.show('.add_loan_response', err, 'Prestamo creado exitosamente.');
    });
  });
};
