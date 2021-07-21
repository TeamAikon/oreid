import React, { useState } from 'react';
import { GoogleLogin, useGoogleLogin, GoogleLogout, useGoogleLogout } from 'react-google-login';
import { OreId } from 'oreid-js'
import logo from './logo.svg';
import { ReactComponent as OreLogo } from './logo-ore.svg';
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

  /** Load the user from local storage - user info is automatically saved to local storage by oreId.getUserInfoFromApi() */
  const fetchOreIdUser = async () => {
    let userInfo = (await oreId.getUser()) || {};
    if( userInfo.accountName ) {
      delete userInfo.permissions
      window.alert(`Your ORE ID: ${JSON.stringify(userInfo, null, 2)}`)
      return userInfo  
    }
    window.alert('Your ORE ID was not found')
    return null
  }

  const oreId = new OreId({
    appName: 'ORE ID - Google OAuth Sample App',
    appId: process.env.REACT_APP_OREID_APP_ID,
    oreIdUrl: process.env.REACT_APP_OREID_URL,
    authCallbackUrl: userAuthCallbackUrl
  });


  const handleOreIdLogin = async () => {
    const idToken = googleLoginResponse.tokenId;
    let { accessToken } = await oreId.login({ idToken });
    console.log('accessToken', accessToken)
    await fetchOreIdUser()
  }
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

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="ORE ID" />
      </header>
      <section className="App-section" >
          {!signedIn && canLogin &&
            <div className="google-login-button">
              <GoogleLogin {...googleLoginProps} />
            </div>
          }
          {signedIn && (
            <>
              <div className="oreid-login-button">
                <button onClick={handleOreIdLogin}>
                  <div>
                    <OreLogo />
                  </div>
                  <span>Login to ORE ID </span>
                </button>
              </div>
              {canLogout && 
                <div className="google-logout-button">
                  <GoogleLogout {...googleLogoutProps} />
                </div>
              }
            </>
          )}
      </section>
    </div>
  );
}

export default App;
