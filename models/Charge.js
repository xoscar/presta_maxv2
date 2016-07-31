const mongoose = require('mongoose');

var chargeSchema = new mongoose.Schema({
  amount: Number, 
  expiration_date: Date, 
  created: {
  	type: Date,
  	default: Date.now,
  },
  weeks: Number,
  description: String,
  paid: {
  	type: Boolean,
  	default: false,
  },
  client_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId, 
});

module.exports = mongoose.model('charges', chargeSchema);