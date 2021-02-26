
## Overview

This example demonstrates the use of a simple Express proxy server with an ORE ID app.
<br>
If your app runs completely in the browser (like a create-react-app does), using a proxy server is required to protect your api key(s) - otherwise they would be exposed in the browser console. This example covers:
- Setting up a simple server using Express
- Hooking up a proxy for requests
- Running the server (and app) in production
<br><br>
### Simple Proxy Server setup using oreid-js
The [oreid-js](https://www.npmjs.com/package/oreid-js) npm module makes it easy to add all the proxy server settings with a single line of code. Just call addOreidExpressMiddleware() and pass in the express server instance and options that include your API key. It will automatically add the proxy routes to the ORE ID service and will inject your API key into the header of every call.
```javascript 
const { addOreidExpressMiddleware } = require('oreid-js/dist/expressMiddleware');
...
// adds api routes for /oreid, /algorand, etc. that can be called by the React App
// also injects apikeys/secrets into request headers
addOreidExpressMiddleware(expressApp, { apiKey: 'my secret api key' })
```
### Setup your project

Create an .env file in the root of the project with your REACT_APP_OREID_APP_ID and keys
 - Hint: Copy the .env.example to .env in the same directory to start your .env
<br>
<br>


```
yarn dev
```

- Runs React app frontend in development mode (on port 3000). <br>
- Runs the proxy server (port 8080)
- IMPORTANT: When running in dev mode, the value for "proxy" in package.json should match the port the proxy server is listening on

    The page will reload if you make edits.

```
yarn start
```

- Used for production
- Runs the server (port 8080)
- Serves the React app from static files in the /build directory
- IMPORTANT: You must first run yarn build to generate the /build files

<br><br>
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
<br><br>

### Proxy Server Articles

- See tutorial on using a proxy server with React [here](https://www.twilio.com/blog/react-app-with-node-js-server-proxy)
- See Generic Project Template [here](https://github.com/philnash/react-express-starter)
<br><br>