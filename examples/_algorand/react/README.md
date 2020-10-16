# ReactJS Algorand Web App Example

A simple ReactJS example that demonstrates use of the oreid-js and provides a few reusable components. This example was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To run sample code:

- You'll need your App ID and API Key - you get them when you register your app with ORE ID [here](http://oreid.io/developer)
- Get an Algorand API key [here](https://developer.purestake.io/)
- Populate .env file in root of project directory with your ORE ID App Id and API key and algorand API key
- OR - you can use the example app settings - copy the .env.example into a file named .env (in project root)

    ```
    cd examples/_algorand/react
    yarn
    yarn dev
    ```

Open [http://localhost:3000](http://localhost:3000) to view the running app.

The code to review is in App.js

The LoginButton React Component simplifies styling of common OAuth providers</br>

If you use the callback handler, it stores the basic user info in a cookie (or local app storage). Local user info can be retrieved by calling getUser() and can be cleared by calling logout()
<br><br>
### IMPORTANT - Signing Sample Transaction
The sample Algorand transaction provided for the signing flow must be updated with current values for 'last-round'. Run the following command and then update the value for 'last-round' in the sample transaction

curl -X GET \\<br>
  'https://testnet-algorand.api.purestake.io/ps2/v2/transactions/params' \\<br>
  -H 'X-API-Key : *{your purestake.io api key}*'
