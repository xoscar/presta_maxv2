const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 1,
  },
  name: String,
});

counterSchema.methods.getNext = function getNext(callback) {
  this.count += 1;

  this.save((err) => {
    if (err) callback(err);
    else callback(null, this.count - 1);
  });
};

module.exports = mongoose.model('counters', counterSchema);
