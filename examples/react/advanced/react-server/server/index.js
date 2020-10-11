// Tutorial on using a proxy server with React - https://www.twilio.com/blog/react-app-with-node-js-server-proxy
// Project Template - https://github.com/philnash/react-express-starter

const express = require('express');
const { addAlgorandApiKeys, addOreIdApiKeys, oreidProxyMiddleware, algorandProxyMiddleware } = require('./configProxy');

const app = express();

// ------ Algorand API
// proxy /algorand/xxx requests to Algorand API (purestake.io)
app.use('/algorand', addAlgorandApiKeys, algorandProxyMiddleware())
// ------- ORE ID API 
// proxy all other requests to OREID_URL server
app.use('/oreid', addOreIdApiKeys, oreidProxyMiddleware())

// body-parser should be after proxy setup
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
