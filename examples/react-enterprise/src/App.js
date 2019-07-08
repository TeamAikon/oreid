import React, { Component } from 'react';
import dotenv from 'dotenv';
import './App.scss';
import { OreId } from 'eos-auth';
dotenv.config();

let chainNetworkForExample = 'eos_kylin';

const { 
  REACT_APP_OREID_APP_ID: appId,              // Provided when you register your app
  REACT_APP_OREID_API_KEY:apiKey,             // Provided when you register your app
  REACT_APP_OREID_SERVICE_KEY:serviceKey,         // Provided when you register your app
  REACT_APP_AUTH_CALLBACK:authCallbackUrl,    // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_SIGN_CALLBACK:signCallbackUrl,    // The url called by the server when transaction signing flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_OREID_URL:oreIdUrl,               // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR:backgroundColor  // Background color shown during login flow
} = process.env;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: null,
      userInfo: {},
      isBusy: false,
      isLoggedIn: false,
      txBroadcast: true
    };

    const setBusyCallback = (isBusy) => {
      this.setState({ isBusy: isBusy });
    };

    // intialize oreId
    this.oreId = new OreId({ appName: 'ORE ID Sample App', appId, apiKey, serviceKey, oreIdUrl, authCallbackUrl, signCallbackUrl, backgroundColor, setBusyCallback });

    this.handleSubmitCreateUser = this.handleSubmitCreateUser.bind(this);
    this.handleSubmitSign = this.handleSubmitSign.bind(this);
    this.onChangeCode = this.onChangeCode.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
  }

  async loadUserFromApi(account) {
    this.clearErrors();

    try {
      const userInfo = await this.oreId.getUserInfoFromApi(account);
      this.setState({ userInfo });
    } catch (error) {
      this.setState({ results: error });
    }
  }

  async requestCode() {
    const args = {
      provider: 'email',
      email: this.state.email,
    };

    const result = await this.oreId.passwordlessSendCodeApi(args);

    if (result.success === true) {
      this.setState({ results: { success: 'check your email for a code' } });
    } else {
      this.setState({ results: { error: 'send code failed' } });
    }
  }

  clearErrors() {
    this.setState({ results: null });
  }

  async handleLogin() {
    let chainNetwork = chainNetworkForExample;
    const provider = 'email';
    const email = this.state.email;
    const code = this.state.code;

    try {
      this.clearErrors();
      let loginResponse = await this.oreId.login({ provider, email, code, chainNetwork });
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

  onChangeValue(value, e) {
    const newValue = e.target.value;
    this.setState({[value]: newValue});
    // if account is updated, add it to sample transaction
    if(value === 'txAccount') {
      this.setState({txTransaction: this.createSampleTransaction(newValue)});
    }
  }

  onChangeCode(e) {
    this.setState({ code: e.target.value });
  }

  async handleSubmitCreateUser(e) {
    e.preventDefault();

    // verify the code is good before login
    // this is optional as it would just fail login if you passed a bad code, but helpful
    // for displaying a quick message to the user
    const { name, userName, email, picture, userPassword, phone, accountType } = this.state;
    const args = { name, userName, email, picture, userPassword, phone, accountType };
    try {
      const result = await this.oreId.custodialNewAccount(args);
      console.log(`new user result:`,result);
    } catch (error) {
      console.log(`new user error:`, error);
    }
  }

  async handleSubmitSign(e) {
    e.preventDefault();

    const { txAccount, txBroadcast, txTransaction, txUserPassword }= this.state;

    // verify the code is good before login
    // this is optional as it would just fail login if you passed a bad code, but helpful
    // for displaying a quick message to the user
    const args = {
      provider: 'custodial', 
      returnSignedTransaction: true, 
      chainNetwork: chainNetworkForExample,
      chainAccount: txAccount,
      account: txAccount,
      broadcast: txBroadcast,
      transaction: txTransaction,
      userPassword: txUserPassword
    };

    try {
      const result = await this.oreId.sign(args);
      console.log(`sign transaction result:`,result);
    } catch (error) {
      console.log(`sign transaction error:`, error);
    }

  }

  createSampleTransaction(actor, permission = 'appdemoappli') {
    const transaction = {
      account: "demoapphello",
      name: "hi",
      authorization: [{
        actor,
        permission,
      }],
      data: {
        user: actor
      }
    };
    return transaction;
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
          Enter New User Info
          <form onSubmit={this.handleSubmitCreateUser}>
              <input type="text" placeholder="name" value={this.state.name} onChange={(e) => this.onChangeValue('name', e)} />
              <input type="text" placeholder="userName" value={this.state.userName} onChange={(e) => this.onChangeValue('userName', e)} />
              <input type="email" placeholder="email" value={this.state.email} onChange={(e) => this.onChangeValue('email', e)} />
              <input type="text" placeholder="picture" value={this.state.picture} onChange={(e) => this.onChangeValue('picture', e)} />
              <input type="text" placeholder="userPassword" value={this.state.userPassword} onChange={(e) => this.onChangeValue('userPassword', e)} />
              <input type="text" placeholder="phone" value={this.state.phone} onChange={(e) => this.onChangeValue('phone', e)} />
              <input type="text" placeholder="accountType" value={this.state.accountType} onChange={(e) => this.onChangeValue('accountType', e)} />
            <input type="submit" value="Create User" />
          </form>

          Enter Sign Transaction Info
          <form onSubmit={this.handleSubmitSign}>
              <input type="text" placeholder="account" value={this.state.txAccount} onChange={(e) => this.onChangeValue('txAccount', e)} />
              <input type="text" placeholder="transaction" value={this.state.txTransaction} onChange={(e) => this.onChangeValue('txTransaction', e)} />
              <input type="text" placeholder="userPassword" value={this.state.txUserPassword} onChange={(e) => this.onChangeValue('txUserPassword', e)} />
              <input type="text" placeholder="broadcast" value={this.state.txBroadcast} onChange={(e) => this.onChangeValue('txBroadcast', e)} />
              <input type="submit" value="Sign Transaction" />
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
          <div className="results">{resultString}</div>
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
