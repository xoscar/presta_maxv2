function ApiMessages(type) {
  this.type = type;
  this.messages = [];
}

ApiMessages.prototype.push = function (field, msg) {
  this.messages.push({
    field: field,
    message: msg,
  });
};

ApiMessages.prototype.flush = function () {
  this.messages = [];
};

ApiMessages.prototype.toString = function () {
  return JSON.stringify(this.messages);
};

module.exports = ApiMessages;
