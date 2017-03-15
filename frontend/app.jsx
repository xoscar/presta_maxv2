import React from 'react';
import ReactDOM from 'react-dom';
import ClientsRoute from './routes/clients.jsx';

const app = document.getElementById('rootNode');

ReactDOM.render(
  <div>
    <ClientsRoute />
  </div>
, app);
