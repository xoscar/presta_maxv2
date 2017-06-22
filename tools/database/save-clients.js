'use strict';

// prepare MongoDB connection
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Client = require('../../models/Client');

dotenv.load({ path: '.env' });

const gracefulExit = () => {
  mongoose.connection.close(() => {
    console.log('> Mongoose shutdown');
    process.exit(0);
  });
};

const startDate = new Date();
console.log(startDate.toISOString() + ' # Starting');

mongoose.connection.on('connected', () => {
  let numOfDocuments = 0;

  // start working
  Client.find()
    .stream()
    .on('data', function onData(doc) {
      this.pause();
      numOfDocuments += 1;

      doc.save(() => this.resume());
    })
    .on('error', (err) => {
      console.log(startDate.toISOString() + ' # Encountered error in stream: ' + err);
    })
    .on('end', (err) => {
      if (err) console.log(startDate.toISOString() + ' # Finished with error: ' + err);

      console.log(`${startDate.toISOString()} # Done, took ${(new Date().getTime() - startDate.getTime()) / 1000} seconds for ${numOfDocuments} documents.`);
    });
});

mongoose.connection.on('error', (err) => {
  console.error('> Failed to connect to MongoDB on startup ', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('> Mongoose default connection to MongoDB disconnected');
});

process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

try {
  mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
  console.log('> Trying to connect to MongoDB...');
} catch (err) {
  console.log('> Sever initialization failed ', err.message);
}
