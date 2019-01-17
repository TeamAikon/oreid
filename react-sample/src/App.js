import dotenv from 'dotenv';
import React, { Component } from 'react';
import { Router, Route } from 'react-router';
import facebookLogo from '../src/_images/logo-facebook.svg';
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
      fbId: null
    };

    this.handleLoginClick = this.handleLoginClick.bind(this);
  }

async handleLoginClick(loginType) {
  // getOreIdAuthUrl returns a fully formed url that you can redirect a user's browser to to start the OAuth login flow
  let oreIdAuthUrl = await oreId.getOreIdAuthUrl({ loginType, callbackUrl:authCallbackUrl, backgroundColor });
  console.log(`To start the OREID login flow, redirect the user's browser to: ${oreIdAuthUrl}`)
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
    const { isLoggedIn } = this.state;

    const facebookLoginStyle = {
      padding: '10px 24px 10px 12px',
      backgroundColor: '#3E5895',
      color: '#fff',
      fontFamily: 'Roboto',
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '0.25px',
      border: 'none',
      borderRadius: '5px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    }

    const facebookLogoStyle = {
      width: '16px',
      marginRight: '12px'
    }

    return (
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-buttons-wrapper">
            {!isLoggedIn &&
              // React inline style button
              <button style={facebookLoginStyle} onClick={()=>this.handleLoginClick("facebook")}>
                <img style={facebookLogoStyle} src={facebookLogo} />Log in with Facebook
              </button>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
