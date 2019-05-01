import React, { Component } from 'react';
import './App.scss';
import { OreId } from 'eos-auth';

const APP_ID = 'demo_0097ed83e0a54e679ca46d082ee0e33a';
const OREID_API_KEY = 'demo_k_97b33a2f8c984fb5b119567ca19e4a49';
const APP_AUTH_CALLBACK = 'http://localhost:3000/authcallback';
const APP_SIGN_CALLBACK = 'http://localhost:3000/signcallback';
const APP_OREID_URL = 'https://staging.oreid.io';
const APP_BACKGROUND_COLOR = '3F7BC7';
const APP_CHAIN_NETWORK = 'eos_kylin';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      code: '',
      results: null,
      userInfo: {},
      isLoggedIn: false,
    };

    const setBusyCallback = (isBusy) => {
      this.v_busyFlag = isBusy;
    };

    // intialize oreId
    this.oreId = new OreId({
      appName: 'ORE ID Sample App',
      appId: APP_ID,
      apiKey: OREID_API_KEY,
      oreIdUrl: APP_OREID_URL,
      authCallbackUrl: APP_AUTH_CALLBACK,
      signCallbackUrl: APP_SIGN_CALLBACK,
      backgroundColor: APP_BACKGROUND_COLOR,
      setBusyCallback,
    });

    this.handleSubmitEmail = this.handleSubmitEmail.bind(this);
    this.handleSubmitCode = this.handleSubmitCode.bind(this);
    this.onChangeCode = this.onChangeCode.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentWillMount() {
    this.loadUserFromLocalState();
    this.handleAuthCallback();
  }

  handleLogout() {
    this.clearErrors();
    this.setState({ userInfo: {}, isLoggedIn: false });
    this.oreId.logout(); //clears local user state (stored in local storage or cookie)
  }

  async loadUserFromLocalState() {
    const userInfo = (await this.oreId.getUser()) || {};
    if ((userInfo || {}).accountName) {
      this.setState({ userInfo, isLoggedIn: true });
    }
  }

  async loadUserFromApi(account) {
    this.clearErrors();

    try {
      const info = await this.oreId.getUserInfoFromApi(account);
      this.setUserInfo(info);

      this.setState({ results: info });
    } catch (error) {
      this.setState({ results: error });
    }
  }

  // Handle the authCallback coming back from ORE-ID with an "account" parameter indicating that a user has logged in
  async handleAuthCallback() {
    const url = window.location.href;
    if (/authcallback/i.test(url)) {
      const { account, errors } = await this.oreId.handleAuthResponse(url);
      if (!errors) {
        this.loadUserFromApi(account);
      }
    }
  }

  async requestCode() {
    const args = {
      'login-type': 'email',
      email: this.state.email,
    };

    const result = await this.oreId.passwordlessSendCodeApi(args);

    if (result.success === true) {
      // check your email for a code
    } else {
      this.setState({ results: { error: 'send code failed' } });
    }
  }

  clearErrors() {
    this.setState({ results: null });
  }

  async handleLogin() {
    let chainNetwork = APP_CHAIN_NETWORK;
    const provider = 'email';
    const email = this.state.email;
    const code = this.state.code;

    try {
      this.clearErrors();
      let loginResponse = await this.oreId.login({ provider, email, code }, chainNetwork);
      //if the login responds with a loginUrl, then redirect the browser to it to start the user's OAuth login flow
      let { isLoggedIn, account, loginUrl } = loginResponse;
      if (loginUrl) {
        //redirect browser to loginURL
        window.location = loginUrl;
      }
      this.setState({ userInfo: { accountName: account }, isLoggedIn: isLoggedIn });
    } catch (error) {
      this.setState({ results: error.message });
    }
  }

  onChangeEmail(e) {
    this.setState({ email: e.target.value });
  }

  onChangeCode(e) {
    this.setState({ code: e.target.value });
  }

  handleSubmitEmail(e) {
    e.preventDefault();

    this.requestCode();
  }

  handleSubmitCode(e) {
    e.preventDefault();

    this.handleLogin();
  }

  render() {
    const { isLoggedIn, userInfo, results } = this.state;

    let mainContent = null;
    if (isLoggedIn) {
      mainContent = (
        <div>
          <div>Is Logged In</div>
        </div>
      );
    } else {
      mainContent = (
        <div>
          <form onSubmit={this.handleSubmitEmail}>
            <label>
              Enter Email:
              <input type="email" value={this.state.email} onChange={this.onChangeEmail} />
            </label>
            <input type="submit" value="Submit Email" />
          </form>

          <form onSubmit={this.handleSubmitCode}>
            <label>
              Submit Code:
              <input type="number" value={this.state.code} onChange={this.onChangeCode} />
            </label>
            <input type="submit" value="Submit Code" />
          </form>
        </div>
      );
    }

    let resultsContent = null;
    if (results && Object.keys(results).length > 0) {
      const resultString = JSON.stringify(results);
      resultsContent = (
        <div>
          <div>Results</div>
          <div>{resultString}</div>
        </div>
      );
    }

    let userInfoContent = null;
    if (userInfo && Object.keys(userInfo).length > 0) {
      const { accountName, email, name, picture, username } = userInfo;

      userInfoContent = (
        <div className="groupClass">
          <div className="user-info-box">
            <img src={picture} style={{ width: 50, height: 50 }} alt="user" />
            <div className="info-title"> accountName</div>
            <div>{accountName}</div>

            <div className="info-title"> name</div>
            <div>{name}</div>

            <div className="info-title"> username</div>
            <div>{username}</div>

            <div className="info-title"> email</div>
            <div>{email}</div>
          </div>

          <button onClick={this.handleLogout}>Logout</button>
        </div>
      );
    }

    return (
      <div className="app">
        <div className="app-content">
          <div className="title-class">ORE ID Passwordless Login</div>
          {mainContent}
          {userInfoContent}
          {resultsContent}
        </div>
      </div>
    );
  }
}

export default App;
