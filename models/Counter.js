const mongoose = require('mongoose');

var counterSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 1,
  },
  name: String,
});

counterSchema.methods.getNext = function (callback) {
  var value = this.count;
  this.count++;
  this.save((err) => {
    if (err) callback(err);
    else callback(null, value);
  });
};

module.exports = mongoose.model('counters', counterSchema);
