function ApiMessages(type) {
  this.type = type;
  this.messages = [];
}

ApiMessages.prototype.push = function push(field, msg) {
  this.messages.push({
    field,
    message: msg,
  });
};

ApiMessages.prototype.flush = function flush() {
  this.messages = [];
};

ApiMessages.prototype.toString = function toString() {
  JSON.stringify(this.messages);
};

module.exports = ApiMessages;
