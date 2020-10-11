// Tutorial on using a proxy server with React - https://www.twilio.com/blog/react-app-with-node-js-server-proxy
// Project Template - https://github.com/philnash/react-express-starter

const express = require('express');
const { addAlgorandApiKeys, addOreIdApiKeys, algorandProxyMiddleware, generateAndReturnHmac, oreidProxyMiddleware } = require('./configProxy');

const app = express();

// ------ Algorand API
// proxy /algorand/xxx requests to Algorand API (purestake.io)
app.use('/algorand', addAlgorandApiKeys, algorandProxyMiddleware())
// ------- ORE ID API 
// use the apiKey to generate an hmac for a provided url
app.use('/oreid/hmac', express.json(), generateAndReturnHmac)
// proxy all other requests to OREID_URL server
app.use('/oreid', addOreIdApiKeys, oreidProxyMiddleware())

// express.json cant be injected before the proxy setup
app.use(express.json())
app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
