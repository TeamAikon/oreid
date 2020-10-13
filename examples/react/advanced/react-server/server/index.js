// Tutorial on using a proxy server with React - https://www.twilio.com/blog/react-app-with-node-js-server-proxy
// Project Template - https://github.com/philnash/react-express-starter

const express = require('express');
const { addOreidExpressMiddleware } = require('oreid-js/dist/expressMiddlewear');

const app = express();

// adds api routes for /oreid, /oreid/hmac, /algorand, etc.
// also injects apikeys/secrets into request headers (secrets must be in .env file)
addOreidExpressMiddleware(app)

// express.json cant be injected before the proxy setup
app.use(express.json())
app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
