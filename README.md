<img src="https://en.gravatar.com/userimage/137186280/281fbdfb8df941e941b3ad68c925c3c7.png" width="70" height="70">

# ORE ID - OAuth for Blockchain



ORE ID allows anyone to access your dApp with one-click sign up and blockchain account creation - using a login flow that they are already familiar with. ORE ID supports Google, Facebook, Github, Linkedin, Twitter, Twitch, and practically any other OAuth-enabled login provider.

With ORE ID, users of your web or mobile app get an on-chain account upon first sign-in. Their private key is encrypted with a PIN of their choosing and stored for them so they don't have to remember their blockchain accounts or keys.

ORE ID also serves as a blockchain wallet for your your users. Your app can request a user to sign a transaction using their PIN (to decrypt their keys and sign the transaction).

ORE ID removes the friction between your app and your future users. 

<img src="./docs/images/OREID-GitHub-diagram-01.png">

# Usage


## To use in your app

### Step 1 - Register your app and logo

Apply [here](https://aikon.com/ore-id) for early access 

### Step 2 - Install library

For Javascript apps, install the npm client module

```
npm install @apimarket/oreid-js 
```

### Step 3 - Keep User Account and Data  

After a login, your app will receive the user's blockchain account name (which maps to public/private keys). Store this account to identify your user. You can also call the user endpoint to get the user's basic identity info (e.g. name, email, avatar picture). If your app is a web app or React Native app, this library will automatically store the user's basic info in local storage. You can retrieve it by calling getUser().

### Step 4 - User can view and control account on the blockchain  

The account is a blockchain account that can be easily viewed on the public blockchain using a block explorer.

The user's account's private key can be transferred to his offline wallet when requested.

Search the chain for the account details and token balances like this - [http://explorer.openrights.exchange/accounts/1pxnubvyqceu](http://explorer.openrights.exchange/accounts/1pxnubvyqceu)


## Example code
```
//Initialize the library

let oreId = new OreId({ apiKey, oreIdUrl });

//Start the OAuth flow by setting the user's browser to this URL
let authUrl = await oreId.getOreIdAuthUrl({ loginType, callbackUrl, backgroundColor });

//Get the user's info given a blockchain account
let userInfo = await oreId.getUserInfoFromApi(account);

OR

//Get the logged-in user's info (automatically saved in local storage)
let userInfo = await oreId.getUser();

```

## Express Middleware

This library includes Express middleware that you can use to simplify handling the callbacks from the ORE ID service. It extracts the results from the /auth and /sign callbacks and attaches info to the request object (e.g. req.user)

```
app.use('/authcallback', authCallbackHandler(oreId) );
```

Take a look at examples/express for a complete example of use.

## Example projects

Refer to the examples folder for the following sample projects

- ReactJS - A simple ReactJS website that includes React Login button component

- React Native - A React Native app that includes a React OAuth flow modal component

- Express Server - A simple Express server that includes the use of middleware to automate handling of callbacks


[Frequently Asked Questions](https://drive.google.com/open?id=1Nx6qm7z8TQRM8S-onmcP0H--21z-gzYDBVEzzfcgE9g)

