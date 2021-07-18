import React, { useState } from 'react';
import { GoogleLogin, useGoogleLogin, GoogleLogout, useGoogleLogout } from 'react-google-login';
import { OreId } from 'oreid-js'
import logo from './logo.svg';
import './App.css';

function App() {
  const onSuccess = (e) => {
    setSignedIn(true)
    setGoogleLoginResponse(e)
  }

  const onLogoutSuccess = (e) => {
    setSignedIn(false)
    setGoogleLoginResponse(null)
  }

  const onFailure = (e) => {
    console.error(e)
  }

  const userAuthCallbackUrl = `${window.location.origin}/oreid/authcallback`

  const handleOreIdLogin = async (event, provider) => {
    event.preventDefault();
    let { loginUrl } = await oreId.login({provider})
    window.location.href = loginUrl; // redirect browser to loginURL to start the login flow
  }

  const oreId = new OreId({
    appName: 'ORE ID - Auth0 Sample App',
    appId: process.env.REACT_APP_OREID_APP_ID,
    apiKey: process.env.REACT_APP_OREID_API_KEY,
    oreIdUrl: process.env.REACT_APP_OREID_URL,
    authCallbackUrl: userAuthCallbackUrl
  });

  const googleAPIprops = {
    clientId: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
    onFailure
  }

  const googleLoginProps = {
    ...googleAPIprops,
    onSuccess
  }

  const { loaded: canLogin, isSignedIn } = useGoogleLogin(googleLoginProps)

  const googleLogoutProps = {
    ...googleAPIprops,
    onLogoutSuccess
  }

  const { loaded: canLogout } = useGoogleLogout(googleLogoutProps)

  const [signedIn, setSignedIn] = useState(isSignedIn)
  const [googleLoginResponse, setGoogleLoginResponse] = useState(null)

  console.group('State:')
  console.log('isSignedIn', isSignedIn || signedIn)
  console.log('canLogin', canLogin)
  console.log('canLogout', canLogout)
  console.groupEnd()
  if(signedIn && googleLoginResponse) console.log('googleLoginResponse', googleLoginResponse)
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={(e) => handleOreIdLogin(e, 'google')}>Login to ORE ID</button>
          {!signedIn && canLogin && <GoogleLogin {...googleLoginProps} />}
          {signedIn && (
            <>
              {canLogout && <GoogleLogout {...googleLogoutProps} />}
            </>
          )}
      </header>
    </div>
  );
}

export default App;
