module.exports.generateFormData = (serializeArray) => {
  const result = {};

  serializeArray.forEach((field) => {
    result[field.name] = field.value;
  });

  return result;
};

module.exports.wait = (seconds, callback) => {
  setTimeout(callback, seconds * 1000);
};
