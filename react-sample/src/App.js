import dotenv from 'dotenv';
import React, { Component } from 'react';
import { Router, Route } from 'react-router';
import LoginButton from './components/loginButton';
import { OreId } from '@apimarket/oreid-js';
import './App.css';

dotenv.config();

const { 
  REACT_APP_OREID_API_KEY:apiKey,             // Provided when you register your app
  REACT_APP_AUTH_CALLBACK:authCallbackUrl,    // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_OREID_URI:oreIdUrl,               // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR:backgroundColor  // Background color shown during login flow
} = process.env;

let oreId = new OreId({ apiKey, oreIdUrl });

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
    };

    this.handleLoginClick = this.handleLoginClick.bind(this);
  }

async handleLoginClick(loginType) {
  // getOreIdAuthUrl returns a fully formed url that you can redirect a user's browser to to start the OAuth login flow
  let oreIdAuthUrl = await oreId.getOreIdAuthUrl({ loginType, callbackUrl:authCallbackUrl, backgroundColor });
  const message = `To start the OREID login flow, redirect the user's browser to: ${oreIdAuthUrl}`;
  console.log(message);
  alert(message);
}

/*
   Handle the authCallback coming back from ORE-ID with an "account" parameter indicating that a user has logged in
*/
async handleAuthCallback() {
  if (/account/.test(window.location.href)) {
    const url = window.location.href;
    if (!url) {
      return;
    }
    const urlParams = await oreId.urlParamsToArray(url);

    return await oreId.getUserInfo(urlParams.account);
  } else {
    throw new Error('authcallback was called without an account variable');
  }
}

  render() {
    return (
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-buttons-wrapper"> 
            {!this.state.isLoggedIn &&
              <LoginButton provider='facebook' buttonStyle={{width:250}} logoStyle={{marginLeft:0}} onClick={()=>this.handleLoginClick("facebook")} text='Login with Facebook'/>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
