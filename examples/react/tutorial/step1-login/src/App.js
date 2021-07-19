import React, { Component } from 'react';
import './App.css';
import { OreId } from 'oreid-js';
import LoginButton from 'oreid-login-button';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      errors: "",
      isLoggedIn: false
    };
    this.handleSubmit = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this)
  }

  authCallbackUrl = `${window.location.origin}/authcallback`

  // Intialize oreId
  // IMPORTANT - For a production app, you must protect your api key. A create-react-app app will leak the key since it all runs in the browser. 
  // To protect the key, you need to set-up a proxy server. See https://github.com/TeamAikon/ore-id-docs/tree/master/examples/react/advanced/react-server
  oreId = new OreId({
    appName: 'ORE ID Sample App',
    appId: process.env.REACT_APP_OREID_APP_ID,
    // apiKey: process.env.REACT_APP_OREID_API_KEY,
    oreIdUrl: 'https://staging.service.oreid.io',
    authCallbackUrl: this.authCallbackUrl
  });

  async componentWillMount() {
    await this.loadUserFromLocalStorage();
    await this.handleAuthCallback(); // handles the auth callback url 
  }

  /* Call oreId.login() - this returns a redirect url which will launch the login flow (for the specified provider) 
     When complete, the browser will be redirected to the authCallbackUrl (specified in oredId options) */
  async handleLogin(event, provider) {
    event.preventDefault();
    if(provider === 'idtoken') return await this.handleLoginWithIdToken(this.idToken)
    let { loginUrl } = await this.oreId.login({ provider });
    window.location = loginUrl; // redirect browser to loginURL to start the login flow
  }

  // get idTokens from Google using Oauth playground - https://stackoverflow.com/questions/25657190/how-to-get-dummy-google-access-token-to-test-oauth-google-api
  idToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdmNTQ4ZjY3MDg2OTBjMjExMjBiMGFiNjY4Y2FhMDc5YWNiYzJiMmYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTU3MzU2MzI4MjU2NzMwNDQyOTYiLCJlbWFpbCI6InNoYXJlYWlrb25AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiIxTXRER0FfTmZyTzloazlMRF9FTjJ3IiwibmFtZSI6IkxlYXJuIFNoYXJlIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBVFhBSnd2aDZlbjRiMGo2eHFzVVlVeVNzUG5vbzVOV3UwRXM0WEdMYTVUPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkxlYXJuIiwiZmFtaWx5X25hbWUiOiJTaGFyZSIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjI2NjY5NzU2LCJleHAiOjE2MjY2NzMzNTZ9.KCawZW71KjBTt8qjEaYR-lyJ-LVw962JyAMESV6wnhiYuG49yDmCDvmmBI_oVJvIwTXC0F3fOaFzEbyf4soW0M0b4OnGnSGn7qxjdjavMdYAz4ZkrjtO-emCB7OmikoI-RliEivS6jna2wmjU6vSnAbB_LP2CvqMl7HXpTSVO8vCrN8Qqz5gyvS_MPOt5d1GAr2fknW_yI6jlIYzntP9rhwdCrxK3wFNeOSMk9FClmFUiplNZXep4aol7UzHUE3Q9Sr6ob17RCQO_HLzvDMK831V3gIXG9hpKcXa6hBL3leRdPi5YZVmf39NJ5adoBRbghl8ny5n6YKk88XsOP76kQ'
  /** login to oreid using an idToken from a 3rd party OAuth flow (e.g. google) */
  async handleLoginWithIdToken(idToken) {
    let { accessToken } = await this.oreId.login({idToken})
    this.oreId.accessToken = accessToken
    await this.loadUserFromLocalStorage()
  }

  /** Remove user info from local storage */
  async handleLogout() {
    this.setState({ userInfo: {}, isLoggedIn: false });
    this.oreId.logout();
    window.location = window.location.origin; // clear callback url in browser
  }

  /** Load the user from local storage - user info is automatically saved to local storage by oreId.getUserInfoFromApi() */
  async loadUserFromLocalStorage() {
    let userInfo = (await this.oreId.getUser()) || {};
    if(userInfo?.accountName) this.setState({ userInfo, isLoggedIn: true });
  }

  /** Retrieve user info from ORE ID service - user info is automatically saved to local storage */
  async loadUserFromApi(account) {
    const userInfo = (await this.oreId.getUserInfoFromApi(account)) || {};
    if(userInfo.accountName) this.setState({ userInfo, isLoggedIn: true });
  }

  /* Handle the authCallback coming back from ORE ID with an "account" parameter indicating that a user has logged in */
  async handleAuthCallback() {
    const urlPath = `${window.location.origin}${window.location.pathname}`;
    if (urlPath === this.authCallbackUrl) {
      const { accessToken, account, errors } = this.oreId.handleAuthResponse(window.location.href);
      if (!errors) {
        await this.loadUserFromApi(account);
        this.setState({ isLoggedIn: true });
      } else {
        this.setState({ errors });
      }
    }
  }

  renderLoggedIn() {
    const { accountName, email, name, picture, username } = this.state.userInfo;
    return (
      <div style={{ marginTop: 50, marginLeft: 40 }}>
        <h4>User Info</h4>
        <img src={picture} style={{ width: 100, height: 100, paddingBottom: 30 }} alt={'user'} />
        <br />
        OreId account: {accountName}
        <br />
        name: {name}
        <br />
        username: {username}
        <br />
        email: {email}
        <br />
        <button onClick={this.handleLogout}> Logout </button>
      </div>
    );
  }

  renderLoggedOut() {
    return (
      <div>
        <LoginButton provider='facebook' onClick={(e) => this.handleLogin(e, 'facebook')}/>
        <LoginButton provider='google' onClick={(e) => this.handleLogin(e, 'google')}/>
        <LoginButton provider='google' text='Login with idToken' onClick={(e) => this.handleLogin(e, 'idtoken')}/>
      </div>
    )
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
        {
        this.state.isLoggedIn ? 
        <div>{this.renderLoggedIn()} </div> : 
        <div>{this.renderLoggedOut()} </div>
        }
        {this.state.errors && (
            <div className="App-error">Error: {this.state.errors}</div>
        )}
        </header>
      </div>
    );
  }
}

export default App;
