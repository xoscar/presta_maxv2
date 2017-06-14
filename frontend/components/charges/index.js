const Charge = require('./charge');
const common = require('../utils/common');
const Response = require('../response/');
const templates = {
  add_charge: require('!mustache!./add_charge.hogan'),
  pay_charge: require('!mustache!./pay_charge.hogan'),
  remove_charge: require('!mustache!./remove_charge.hogan'),
  update_charge: require('!mustache!./update_charge.hogan'),
};

var charge = null;
var $rootNode = null;

function openModal(template, data) {
  $rootNode.find('.charge_view').html(templates[template](data));
  $rootNode.find('.charge_modal').openModal();
}

module.exports.init = function (user, token, root) {
  var headers = [{
    name: 'user',
    value: user,
  }, {
    name: 'token',
    value: token,
  }, ];
  charge = new Charge(headers);
  $rootNode = $(root);
  Response.setRootNode($rootNode);

  $rootNode.on('click', '.add_charge', function (event) {
    event.preventDefault();
    var data = { client_id: $(this).attr('href') };
    openModal('add_charge', data);
  });

  $rootNode.on('submit', '.add_charge_form', function (event) {
    event.preventDefault();
    var $this = $(this);
    var data = common.generateFormData($this.serializeArray());
    charge.create(data, function (err) {
      if (!err) $this[0].reset();
      Response.show('.add_charge_response', err, 'Prestamo creado exitosamente.');
    });
  });

  $rootNode.on('click', '.pay_charge', function (event) {
    event.preventDefault();
    var data = { charge_id: $(this).attr('href') };
    openModal('pay_charge', data);
  });

  $rootNode.on('submit', '.pay_charge_form', function (event) {
    event.preventDefault();
    var id = $(this).attr('href');
    charge.pay(id, function (err) {
      if (!err) $rootNode.find('.charge_modal').closeModal();
    });
  });

  $rootNode.on('click', '.update_charge', function (event) {
    event.preventDefault();
    charge.get($(this).attr('href'), function (err, charge) {
      if (!err) openModal('update_charge', charge);
    });
  });

  $rootNode.on('submit', '.update_charge_form', function (event) {
    event.preventDefault();
    var id = $(this).attr('href');
    var data = common.generateFormData($(this).serializeArray());
    charge.update(id, data, function (err) {
      if (!err) $rootNode.find('.charge_modal').closeModal();
      Response.show('.update_charge_response', err, 'Cargo modificado exitosamente.');
    });
  });

  $rootNode.on('click', '.remove_charge', function (event) {
    event.preventDefault();
    var data = { charge_id: $(this).attr('href') };
    openModal('remove_charge', data);
  });

  $rootNode.on('submit', '.remove_charge_form', function (event) {
    event.preventDefault();
    var id = $(this).attr('href');
    charge.delete(id, function (err) {
      if (!err) $rootNode.find('.charge_modal').closeModal();
    });
  });
};
