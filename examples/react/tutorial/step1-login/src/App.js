import React, { Component } from 'react';
import './App.css';
import { OreId } from 'oreid-js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      isLoggedIn: false
    };
    this.handleSubmit = this.renderLoggedOut.bind(this);
    this.handleLogout = this.handleLogout.bind(this)
  }

  authCallbackUrl = 'http://localhost:3000/authcallback'

  // intialize oreId
  oreId = new OreId({
    appName: 'ORE ID Sample App',
    appId: process.env.REACT_APP_OREID_APP_ID,
    apiKey: process.env.REACT_APP_OREID_API_KEY,
    oreIdUrl: 'http://service.oreid.io',
    authCallbackUrl: this.authCallbackUrl
  });

  async componentWillMount() {
    await this.loadUserFromLocalStorage();
    await this.handleAuthCallback(); // handles the auth callback url when 
  }

  /* Call oreId.login() - this returns a redirect url which will launch the login flow (specified by provider) 
     When complete, the browser will be redirected to the authCallbackUrl (specified in oredId options) */
  async handleLogin(event, provider) {
    event.preventDefault();
    let { loginUrl } = await this.oreId.login({provider})
    window.location = loginUrl; // redirect browser to loginURL to start the login flow
  }

  /* Handle the authCallback coming back from ORE ID with an "account" parameter indicating that a user has logged in */
  async handleAuthCallback() {
    const urlPath = `${window.location.origin}${window.location.pathname}`;
    if (urlPath === this.authCallbackUrl) {
      const { account, errors } = this.oreId.handleAuthResponse(window.location.href);
      if (!errors) {
        await this.loadUserFromApi(account);
        this.setState({ isLoggedIn: true });
      }
    }
  }

  /** load the user from local storage - user info is automatically saved to local storage by oreId.getUserInfoFromApi() */
  async loadUserFromLocalStorage() {
    let userInfo = (await this.oreId.getUser()) || {};
    if(userInfo.accountName) this.setState({ userInfo, isLoggedIn: true });
  }

  /** retrieve user info from ORE ID service - user info is automatically saved to local storage */
  async loadUserFromApi(account) {
    const userInfo = (await this.oreId.getUserInfoFromApi(account)) || {};
    if(userInfo.accountName) this.setState({ userInfo, isLoggedIn: true });
  }

  /** remove user info from local storage */
  async handleLogout() {
    this.setState({ userInfo: {}, isLoggedIn: false });
    this.oreId.logout();
    window.location = window.location.origin; // clear callback url
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
    const { accountName, email, name, picture, username } = this.state.userInfo;
    return (
      <div>
        <button provider='facebook'
          buttonStyle={{ width: 225, marginLeft: -20, marginTop: 20, marginBottom: 10 }}
          onClick={(e) => this.handleLogin(e, 'facebook')}>Login Facebook</button>
        <button onClick={(e) => this.handleLogin(e, 'google')}>Login Google</button>
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
        </header>
      </div>
    );
  }
}
export default App;
