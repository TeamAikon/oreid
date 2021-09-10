// Tutorial on using a proxy server with React - https://www.twilio.com/blog/react-app-with-node-js-server-proxy
// Project Template - https://github.com/philnash/react-express-starter

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { addOreidExpressMiddleware } = require('oreid-js/dist/expressMiddleware');

const PORT = 8080 // if you change this port, you should update "proxy" in package.json to match - "proxy" is used by React app during development only
dotenv.config();
const app = express();

// adds api routes for /oreid/api, /oreid/prepare-url, /algorand, etc.
// also injects apikeys/secrets into request headers
addOreidExpressMiddleware(app, { apiKey: process.env.OREID_API_KEY, oreidUrl: process.env.REACT_APP_OREID_URL })

// frontend - static web files - /build must first be created by: yarn build
app.use('/', express.static(`${__dirname}/../build`));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../build/index.html'));
});

const listener = app.listen(PORT, () => {
  console.log(`Express proxy server is running on port:${listener.address().port}`);
});
