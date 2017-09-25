// dependencies.
const express = require('express');
const dotenv = require('dotenv');

const path = require('path');
const fs = require('fs');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

/**
 * Create Express server.
 */
const app = express();


app.set('port', process.env.APP_PORT || 3000);

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

app.use('/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
  });

  fs.createReadStream(path.join(__dirname, 'views/main.html')).pipe(res);
});

app.listen(app.get('port'), () => {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});
