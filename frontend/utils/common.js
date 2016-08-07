module.exports.generateFormData = function (serializeArray) {
  var result = {};

  serializeArray.forEach(function (field) {
    result[field.name] = field.value;
  });

  return result;
};
