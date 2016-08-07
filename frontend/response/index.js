var template = require('!mustache!./response.hogan');
var $rootNode = null;

module.exports.show = function (selector, err, response) {
  var messages = null;
  if (err) messages = { errors: JSON.parse(err.responseText).messages };
  else if (response) messages = { success: [{ message: response }] };
  if (messages)
    $rootNode.find(selector).html(template(messages));
};

module.exports.setRootNode = function (root) {
  $rootNode = root;
};
