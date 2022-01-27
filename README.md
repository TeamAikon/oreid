<img src="https://en.gravatar.com/userimage/137186280/281fbdfb8df941e941b3ad68c925c3c7.png" width="70" height="70">

# ORE ID - OAuth for Blockchain



ORE ID allows anyone to access your dApp with one-click sign up and blockchain account creation - using a login flow that they are already familiar with. ORE ID supports Apple, Google, Facebook, Github, Linkedin, Twitter, Twitch, and practically any other OAuth-enabled login provider.

With ORE ID, users of your web or mobile app get an on-chain account upon first sign-in. Their private key is encrypted with a PIN of their choosing and stored for them so they don't have to remember their blockchain accounts or keys.

ORE ID also serves as a blockchain wallet for your users. Your app can request a user to sign a transaction using their PIN to decrypt their keys.

ORE ID is the easiest way to add support for Scatter, Ledger Nano S, Metro and every other EOS wallet that supports the new [Transit API](https://github.com/eosnewyork/eos-transit) standard. Just add our oreid-js library and your app will instantly support these popular wallets.

ORE ID removes the friction between your app and your future users. 

<img src="./docs/images/OREID-GitHub-diagram-01.png">

# Quick Start Guide

To run sample code, start with the React examples from our tutorial:

First, clone this repo to your local machine.
```shell
git clone https://github.com/TeamAikon/ore-id-docs.git
```

Now, run the first example by entering the following:
```shell
cd examples/react/tutorial/step1-login
npm install
yarn start
```
    
Continue onto step 2 and 3.  These will demonstrate ORE-ID signing and the new web-widget.

# Usage


## To use in your app

### Step 1 - Register your app and logo

Create a developer account [here](https://oreid.io/developer/new-app).

Note your API-Key and APP-ID in the developer dashboard under "settings".

### Step 2 - Install library

For Javascript apps, install the npm client module
```shell
npm install oreid-js
```

Import oreid-js in your module:
```typescript
import { OreId } from 'oreid-js';
```

~ OR ~

Require oreid-js in your application:
```javascript
const { OreId } = require('oreid-js');
```

Declare the ORE-ID Options
```typescript
let oreIdOptions: OreIdOptions = {
    appName: "My Sample App",
    appId: "t_fb2b....b6f7",
    apiKey: "t_k071....daf1",
    authCallbackUrl: 'http://localhost:8000'
}
```

Initialize the library in your application:
```typescript
let oreId = new oreId(oreIdOptions);
```

### Step 3 - Call Login

Call login and specify a provider (facebook, scatter, etc.) 
```typescript
async function loginUser() {
    try {
        let authProvider = AuthProvider.Google
        
        let loginOptions: LoginOptions = {
            provider: authProvider,
            chainNetwork: ChainNetwork.EosKylin
        }
        let loginResponse = await oreId.login(loginOptions)
        console.log(loginResponse)
    }
    catch (error) {
        console.error(error)
    }
}
```

 After login, your app will receive the user's blockchain account name (which maps to public/private keys).
 ```text
http://localhost:8000/?account=ore1sbx3rf4j&process_id=277xxxxxxx7f&access_token=ey...
 ```
 
The user's info will automatically be stored in local state (cookie, etc.) and will be restored the next time the user uses your app.

```typscript
async function retrieveUserInfo() {

}
```
  
You can also call the user endpoint at any time to get the user's basic identity info (e.g. name, email, avatar picture)
```typescript
async function retrieveUserInfoFromApi() {

} 
```

### Step 4 - Call Sign

When your app needs the user to sign a blockchain transaction, you just specify the chain name (e.g. eos_main) and chain account if you know it. 

```

If you don't know which EOS blockchain accounts the user has or in which wallet they are stored, you can call the discover function that will prompt the user to unlock their wallet. Public keys stored in the wallet will be automatically remembered so you can help the user find the right wallet and keys quickly the next time they need to repeat a transaction. Awesome!

### Step 5 - User can view and control account on the blockchain  

The account is a blockchain account that can be easily viewed on the public blockchain using a block explorer. [ORE Block Explorer](https://explorer.ore.network/)

The user's account's private key can be transferred to an offline wallet when requested.

Search the chain for account details and token balances like this - [http://explorer.openrights.exchange/accounts/1pxnubvyqceu](http://explorer.openrights.exchange/accounts/1pxnubvyqceu)


## Example code
```javascript
//Initialize the library
let oreId = new OreId({ appName:"My App", appId, apiKey, ... })

//Start the OAuth flow by setting browser to URL returned by login
let loginResponse = await oreId.login({provider:'facebook'});
window.location = loginResponse.loginUrl

//Get the user's info given a blockchain account
let userInfo = await oreId.getUserInfoFromApi(account)

//Start the ORE ID signing process
let signResponse = await oreId.sign(signOptions)
window.location = signResponse.signUrl

OR

//Start the signing process using local wallet app
let signResponse = await oreId.sign({provider:'scatter', chainNetwork:'eos_kylin', transaction, ...})
console.log(signResponse.signedTransaction)
```

## Express Middleware

The [oreid-js](https://www.npmjs.com/package/oreid-js) npm module includes Express middleware that you can use to simplify handling the callbacks from the ORE ID service. It extracts the results from the /auth and /sign callbacks and attaches info to the request object (e.g. req.user)

```javascript
app.use('/authcallback', authCallbackHandler(oreId) );
```

## Proxy Server for Production Apps

If you are building an app that runs entirely in the browser (like a create-react-app app does), you must run a simple proxy server to protect your api-key. When the React app tries to call an ORE ID API endpoint, the proxy server will inject your api-key into the request header.<br>
The [oreid-js](https://www.npmjs.com/package/oreid-js) npm module includes Express middleware that makes it easy to configure your proxy server. 

```javascript
// proxy server middlewear that injects apikeys/secrets into request headers
addOreidExpressMiddleware(expressApp, { apiKey: 'my secret api key' })
```

Take a look at the complete example of using a proxy server [here](https://github.com/TeamAikon/ore-id-docs/tree/master/examples/react/advanced/react-server).

## Example projects

Refer to the examples folder for the following sample projects

- ReactJS - Several ReactJS apps that includes React Login button component

- React Native - A React Native app that includes a React OAuth flow modal component

- Express Server - A simple Express server that includes the use of middleware to automate handling of callbacks
  
- Proxy Server - A complete example using a Proxy Server to run along side an app that runs completely in the browser (like a create-react-app app)

If you are only using one chain in your app, check out examples just for that chain in its own directory. Ex: /examples/_ethereum


[Frequently Asked Questions](https://drive.google.com/open?id=1Nx6qm7z8TQRM8S-onmcP0H--21z-gzYDBVEzzfcgE9g)

[How ORE ID Works](https://docs.google.com/document/d/1n09swvocpR2WkP5iFc_VMrmmlnx3S1j72Zy6yDvcuYw/edit?usp=sharing)

[<img src="./docs/images/eos-transit-logo.png">](https://github.com/eosnewyork/eos-transit)
