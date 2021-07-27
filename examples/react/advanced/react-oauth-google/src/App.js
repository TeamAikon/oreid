import React, { useEffect, useState } from "react";
import {
  GoogleLogin,
  useGoogleLogin,
  GoogleLogout,
  useGoogleLogout,
} from "react-google-login";
import { OreId } from "oreid-js";
import logo from "./logo-oreid.svg";
import "./App.css";

const googleOauthClientId = "571262146536-le7c8genogladg68ubqb5l0f8nijhgr5.apps.googleusercontent.com";

function App() {
  const [loggedIn, setLoggedIn] = useState({});
  const [user, setUser] = useState({});
  const [googleLoginResponse, setGoogleLoginResponse] = useState(null);

  useEffect(() => {
    fetchOreIdUser();
  }, []);

  const onSuccess = async (e) => {
    setLoggedIn(true);
    fetchOreIdUser().then(() => {
      const googleUser = {...e?.profileObj, idToken: e?.tokenId }
      setGoogleLoginResponse(googleUser)
      loginToOreId(googleUser.idToken);
    });
  };

  const onLogoutSuccess = (e) => {
    setLoggedIn(false);
    setGoogleLoginResponse(null);
    oreId.logout(); // clears ORE ID accessToken
  };

  const onFailure = (e) => {
    console.error(e);
  };

  const googleOauthProps = {
    clientId: googleOauthClientId,
    onFailure,
  };

  const { loaded: canLogin, isSignedIn: googleSignedIn } = useGoogleLogin({...googleOauthProps, onSuccess});
  const { loaded: canLogout } = useGoogleLogout({ ...googleOauthProps, onLogoutSuccess });

  /** Initialize Ore Id */
  const oreId = new OreId({
    appName: "ORE ID - Google OAuth Sample App",
    appId: "demo_0097ed83e0a54e679ca46d082ee0e33a",
    oreIdUrl: "https://service.oreid.io",
  });

  /** Load the user from local storage - user info is automatically saved to local storage by oreId.getUserInfoFromApi() */
  const fetchOreIdUser = async () => {
    let userInfo = (await oreId.getUser()) || {};
    if (userInfo?.accountName) {
      if (userInfo.accountName) setUser({ ...userInfo });
      setLoggedIn(true);
    }
  };

  //** Convert Google IdToken to ORE ID accessToken */
  const loginToOreId = async (idToken) => {
    console.log("got to handleOreIdLogin");
    oreId.login({ idToken }).then(({ accessToken }) => {
      oreId.accessToken = accessToken // saves accessToken in local storage
      fetchOreIdUser();
    });
  };

  const renderLoggedIn = () => {
    const { accountName, email, name, picture, username } = user;
    return (
      <div>
        <div className="google-logout-button">
          <GoogleLogout { ...{...googleOauthProps, onLogoutSuccess} } />
        </div>
        <div style={{ marginTop: 40 }}>
          <h4>User Info</h4>
          <img src={picture} />
          <br />
          OreId account: {accountName}
          <br />
          name: {name}
          <br />
          username: {username}
          <br />
          email: {email}
          <br />
        </div>
      </div>
    );
  };

  const renderLoggedOut = () => {
    return (
      <div>
        {!loggedIn && canLogin && (
          <div className="google-login-button">
            <GoogleLogin { ...{ ...googleOauthProps, onSuccess }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="ORE ID" />
        {loggedIn ? (
          <div>{renderLoggedIn()} </div>
        ) : (
          <div>{renderLoggedOut()} </div>
        )}
        <section className="App-section"></section>
      </header>
    </div>
  );
}

export default App;
