// dependencies.
const express = require('express');
const dotenv = require('dotenv');

const path = require('path');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
if (process.env.NODE_ENV !== 'production') {
  dotenv.load({ path: '../.env' });
}

/**
 * Create Express server.
 */
const app = express();

app.set('port', process.env.PORT || process.env.APP_PORT);

app.use(express.static(path.join(__dirname, '/public'), { maxAge: 31557600000 }));

app.listen(app.get('port'), () => {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});
