const Charge = require('./charge');
const common = require('../utils/common');
const Response = require('../response/');
const templates = {
  add_charge: require('!mustache!./add_charge.hogan'),
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
  loans = new Charge(headers);
  $rootNode = $(root);
  Response.setRootNode($rootNode);

  $rootNode.on('click', '.add_charge', function (event) {
    event.preventDefault();
    var clientId = $(this).attr('href');
    $rootNode.find('.add_charge_view').html(templates.add_charge({ client_id: clientId }));
    $rootNode.find('.add_charge_modal').openModal();
  });

  $rootNode.on('submit', '.add_charge_form', function (event) {
    event.preventDefault();
    var $this = $(this);
    var data = common.generateFormData($this.serializeArray());
    loans.create(data, function (err) {
      if (!err) $this[0].reset();
      Response.show('.add_charge_response', err, 'Prestamo creado exitosamente.');
    });
  });
};
