This project demonstrates calling the 'eos-auth' api to use ORE IDs passwordless login for email.
This is useful if you would like to provide your own UI for authorizing users without using oreid's user interface.

## Example code

```javascript
// Initialize the library
const oreId = new OreId({ appName:"My App", appId, apiKey, ... })

// request code for your email address
const args = {
    provider: 'email',
    email: 'steve@example.com',
};
const result = await oreId.passwordlessSendCodeApi(args);

// email is sent, get the code and call this to login
let loginResponse = await this.oreId.login({ provider:'email', email:'steve@example.com', codeFromEmail, chainNetwork:'eos_kylin' });
//redirect browser to loginURL
window.location = loginResponse.loginUrl;

// Get the user's info given a blockchain account
letInfo = await oreId.getUserInfoFromApi(loginResponse.account)
```

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
