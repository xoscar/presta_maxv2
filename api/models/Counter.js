const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 1,
  },
  name: String,
});

counterSchema.methods.getNext = function getNext() {
  this.count += 1;

  return this.save()

  .then(() => (
    Promise.resolve(this.count - 1)
  ));
};

module.exports = mongoose.model('counters', counterSchema);
