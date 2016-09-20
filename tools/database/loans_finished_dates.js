// prepare MongoDB connection
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Loan = require('../../models/Loan').Loan;
const moment = require('moment-timezone');

dotenv.load({ path: '.env' });

var gracefulExit = function () {
  mongoose.connection.close(function () {
    console.log('> Mongoose shutdown');
    process.exit(0);
  });
};

/////////////
// Runtime //
/////////////

const startDate = new Date();
console.log(startDate.toISOString() + ' # Starting');

mongoose.connection.on('connected', function () {

  var numOfDocuments = 0;

  // start working
  Loan
    .find({
      finished: true,
    }).stream()
    .on('data', function (doc) {
      var _this = this;
      _this.pause();
      numOfDocuments++;

      if (doc.payments.length === 0) return _this.resume();

      var finishedDate = moment(doc.getPayments()[doc.payments.length - 1].created, 'DD/MM/YYYY HH:mm').toDate();
      doc.finished_date = finishedDate;
      doc.save(() => _this.resume());

    })
    .on('error', function (err) {
      console.log(startDate.toISOString() + ' # Encountered error in stream: ' + err);
    })
    .on('end', function (err) {
      if (err) console.log(startDate.toISOString() + ' # Finished with error: ' + err);

      var message = 'Done, took ' +
        (new Date().getTime() - startDate.getTime()) / 1000 + ' seconds for ' +
        numOfDocuments + ' documents.';

      console.log(startDate.toISOString() + ' # ' + message);

    });

});

//////////////////////
// Mongo connection //
//////////////////////

mongoose.connection.on('error', function (err) {
  console.error('> Failed to connect to MongoDB on startup ', err);
});

mongoose.connection.on('disconnected', function () {
  console.log('> Mongoose default connection to MongoDB disconnected');
});

process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

try {
  mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
  console.log('> Trying to connect to MongoDB...');
} catch (err) {
  console.log('> Sever initialization failed ', err.message);
}
