// dependencies.
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const moment = require('moment-timezone');

// routes
const clients = require('./routes/clients');
const loans = require('./routes/loans');
const charges = require('./routes/charges');
const users = require('./routes/users');
const payments = require('./routes/payments');

moment.locale('es');
moment.tz.setDefault('America/Mexico_City');

if (process.env.NODE_ENV !== 'production') {
  dotenv.load({ path: '../.env' });
}

const app = express();

mongoose.Promise = Promise;

mongoose.connect(process.env.MONGOLAB_URI || `${process.env.MONGODB_PORT_27017_TCP_ADDR}/prestamax`);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');

  app.set('port', process.env.PORT || process.env.API_PORT);
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(cors());

  app.use('/clients', clients);
  app.use('/loans', loans);
  app.use('/loans', payments);
  app.use('/charges', charges);
  app.use('/users', users);

  app.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
  });
});
