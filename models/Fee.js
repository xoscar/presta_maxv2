const mongoose = require('mongoose');

var feeSchema = new mongoose.Schema({
  amount: Number,
  week: Number,
  description: String,
  created: {
  	type: Date,
  	default: Date.now,
  },
  client_id: mongoose.Schema.Types.ObjectId,
  loan_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId, 
});

module.exports = mongoose.model('fees', feeSchema);