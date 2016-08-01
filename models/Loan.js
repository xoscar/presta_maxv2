const mongoose = require('mongoose');
const moment = require('moment');
moment.locale('es');

var paymentSchema = new mongoose.Schema({
  amount: Number,
  created: {
    type: Date,
    default: Date.now,
  },
});

var loanSchema = new mongoose.Schema({
  amount: Number,
  weekly_payment: Number,
  file: String,
  description: String,
  created: {
    type: Date,
    default: Date.now,
  },
  finished: {
    type: Boolean,
    default: false,
  },
  weeks: Number,
  expired_date: Date,
  client_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId,
  payments: [paymentSchema],
});

loanSchema.methods.getBasicInfo = function () {
  var expired = false;
  if (moment().isAfter(this.expired_date))
    expired = true;
  return {
    id: this.id,
    amount: '$' + this.amount + '.00',
    weekly_payment: '$' + this.weekly_payment + '.00',
    created: this.created,
    weeks: this.weeks,
    last_payment: this.getLastPayment(),
    expired: expired,
    expired_date: this.expired_date,
    finished: this.finished ? 'Si' : 'No',
    current_balance: this.getCurrentBalance(),
  };
};

loanSchema.methods.getLastPayment = function () {
  if (this.payments.length === 0)
    return null;
  var orderedPayments = this.payments.sort(function (a, b) {
    return moment(a.created).isAfter(b.created) ? 1 : -1;
  });

  return orderedPayments[orderedPayments.length - 1].created;
};

loanSchema.methods.getCurrentBalance = function () {
  var totalPayments = 0;
  if (this.payments.length > 0)
    this.payments.forEach(function (a) {
      totalPayments += parseInt(a.amount);
    });
  return this.amount - totalPayments;
};

module.exports.Loan = mongoose.model('loans', loanSchema);
module.exports.Payment = mongoose.model('payments', paymentSchema);
