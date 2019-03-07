# ReactJS Web App Example

A simple ReactJS example that demonstrates use of the oreid-js and provides a few reusable components. This example was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To run sample code:

- You'll need your App ID and API Key - you get them when you register your app with ORE ID (Note:  .env.example includes an app ID and key for a demo app you can use until you register your own app)
- Populate .env file in root of project directory (copy .env.example to examples/react/.env)

    ```
    cd examples/react
    npm install
    npm start
    ```


Open [http://localhost:3000](http://localhost:3000) to view the running app.

The code to review is in App.js

The LoginButton React Component simplifies styling of common OAuth providers</br>

If you use the callback handler, it stores the basic user info in a cookie (or local app storage). Local user info can be retrieved by calling getUser() and can be cleared by calling logout()
