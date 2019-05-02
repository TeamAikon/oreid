This project demonstrates calling the 'eos-auth' api to use ORE IDs passwordless login for email.
This is useful if you would like to provide your own UI for authorizing users without using oreid's user interface.

## Example code

```javascript
// STEP 1:
// Initialize the library
const oreId = new OreId({ appName:"My App", appId, apiKey, ... })

// STEP 2:
// Request code for the users email address. An email will be sent to the user.
 const result = await oreId.passwordlessSendCodeApi({ provider: 'email',  email: 'steve@example.com'});

// STEP 3:
// Verify the code sent in the email is correct.
const result = await this.oreId.passwordlessVerifyCodeApi(args);
if (result.success === true) {
    // code is OK
}

// STEP 4:
// Login in the user by sending the email and code from the email
const loginResponse = await this.oreId.login({ provider:'email', email:'steve@example.com', codeFromEmail, chainNetwork:'eos_kylin' });

// STEP 5:
// Redirect browser to loginURL
window.location = loginResponse.loginUrl;

// STEP 6: (optional)
// Get the user's info given a blockchain account
const info = await oreId.getUserInfoFromApi(loginResponse.account)
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
