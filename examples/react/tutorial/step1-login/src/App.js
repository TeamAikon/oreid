import React, { Component } from 'react';
import './App.css';
import { OreId } from 'oreid-js';
import { OreIdWebWidget } from "oreid-webwidget";
import LoginButton from 'oreid-login-button';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: {},
      errors: "",
      isLoggedIn: false
    };
    this.handleSubmit = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this)
  }

  REACT_APP_OREID_APP_ID="demo_0097ed83e0a54e679ca46d082ee0e33a"
  REACT_APP_OREID_API_KEY="demo_k_97b33a2f8c984fb5b119567ca19e4a49"

  authCallbackUrl = `${window.location.origin}/authcallback`

  // Intialize oreId
  // IMPORTANT - For a production app, you must protect your api key. A create-react-app app will leak the key since it all runs in the browser. 
  // To protect the key, you need to set-up a proxy server. See https://github.com/TeamAikon/ore-id-docs/tree/master/examples/react/advanced/react-server
  oreId = new OreId({
    appName: 'ORE ID Sample App',
    appId: this.REACT_APP_OREID_APP_ID,
    // apiKey: this.REACT_APP_OREID_API_KEY,
    oreIdUrl: "http://localhost:8080",
  });

  webwidget = new OreIdWebWidget(this.oreId, window);

  async componentWillMount() {
    await this.loadUser();
  }

  /* Present a popup for the user to login
     When complete, the accessToken will be updated in oreid.auth */
  async handleLogin(event, provider) {
    event.preventDefault();
    this.webwidget.onAuth({
			params: { provider: 'google'},
			onError: console.error,
			onSuccess: async (data) => { await this.loadUser() },
		});
  }

  // get idTokens from Google using Oauth playground - https://stackoverflow.com/questions/25657190/how-to-get-dummy-google-access-token-to-test-oauth-google-api
  idToken = 'ey...'
  /** login to oreid using an idToken from a 3rd party OAuth flow (e.g. google) */
  async handleLoginWithIdToken(idToken) {
    let { accessToken } = await this.oreId.loginWithToken({idToken})
    this.oreId.accessToken = accessToken
    await this.loadUser()
  }

  /** Remove user info from local storage */
  async handleLogout() {
    this.setState({ userInfo: {}, isLoggedIn: false });
    this.oreId.logout();
    window.location = window.location.origin; // clear callback url in browser
  }

  /** Load the user from local storage - user info is automatically saved to local storage by oreId.getUserInfoFromApi() */
  async loadUser() {
    if(!this.oreId.auth.isLoggedIn) return
    let { user } = this.oreId.auth
    await user.getData()
    this.setState({ userData: user.data, isLoggedIn: true });
  }

  renderLoggedIn() {
    const { accountName, email, name, picture, username } = this.state.userData;
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
        <LoginButton provider='google' text='Login with idToken' onClick={(e) => this.handleLoginWithIdToken(e, 'idtoken')}/>
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
