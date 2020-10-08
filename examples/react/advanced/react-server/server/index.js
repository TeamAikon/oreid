
// Tutorial on using a proxy server with React - https://www.twilio.com/blog/react-app-with-node-js-server-proxy
// Project Template - https://github.com/philnash/react-express-starter

const express = require('express');
const bodyParser = require('body-parser');
// const pino = require('express-pino-logger')();
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
// app.use(pino);

app.use('/algorand', function (req, res, next) {
  console.log('got to algorand proxy')
  next()
})

// ------ Algorand
// proxy requests to Algorand API (purestake.io)
app.use('/algorand', addAlgorandApiKeys) 
// Appends Algorand api key to header
function addAlgorandApiKeys(req, res, next) {
  req.headers['X-API-Key'] = process.env.ALGORAND_API_KEY
  next()
}
app.use('/algorand/mainnet', createProxyMiddleware({ target: 'http://mainnet-algorand.api.purestake.io', changeOrigin: true }))
app.use('/algorand/testnet', createProxyMiddleware({ target: 'http://testnet-algorand.api.purestake.io', changeOrigin: true }))
app.use('/algorand/betanet', createProxyMiddleware({ target: 'http://betanet-algorand.api.purestake.io', changeOrigin: true }))

app.use('/algorand/testnet/params', getParams)


// ------- ORE ID api 
app.use('/', addApiKeys)
// Replaces any api key variable names with the actual secret value
function addApiKeys(req, res, next) {
  for (const [key, value] of Object.entries(req.headers)) {
    if(key.toLowerCase() === 'api-key') req.headers['api-key'] = process.env.OREID_API_KEY
    if(key.toLowerCase() === 'service-key') req.headers['service-key'] = process.env.OREID_SERVICE_KEY
  }
  next()
}
// proxy all other requests to this server to OREID_URL
app.use('/', createProxyMiddleware({ target: process.env.OREID_URL, changeOrigin: true }))


app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
