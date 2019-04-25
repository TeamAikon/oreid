# Express Server Example

A complete Express server example that demonstrates use of the oreid-js middleware.

To run sample code:

- You'll need your App ID and API Key - you get them when you register your app with ORE ID
- Populate .env file in root of project directory (copy .env.example to examples/express/.env)

```
cd examples/express
npm install

node index.js

//to trigger login flow
http://localhost:8888/login/facebook

```

Note: When the callback is handled by handleAuthResponse middleware, it adds the new user state to the request object (e.g. req.user).

# Express Middleware

oreid-js includes Express middleware that you can use to simplify handling the callbacks from the ORE ID service.

```
// authCallbackHandler middleware handles callback response from ORE ID and extracts results

app.use('/authcallback', authCallbackHandler(oreId) );
```
