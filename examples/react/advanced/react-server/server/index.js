// Tutorial on using a proxy server with React - https://www.twilio.com/blog/react-app-with-node-js-server-proxy
// Project Template - https://github.com/philnash/react-express-starter

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { addOreidExpressMiddleware } = require('oreid-js/dist/expressMiddlewear');

const PORT = 8080
dotenv.config();
const app = express();

// adds api routes for /oreid, /oreid/hmac, /algorand, etc.
// also injects apikeys/secrets into request headers
addOreidExpressMiddleware(app, { apiKey: process.env.OREID_API_KEY })

// frontend - static web files - /build must first be created by: yarn build
app.use('/', express.static(`${__dirname}/../build`));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../build/index.html'));
});

const listener = app.listen(PORT, () => {
  console.log(`Express proxy server is running on port:${listener.address().port}`);
});
