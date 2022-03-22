import React, { Component } from 'react';
import LoginButton from 'oreid-login-button';
import { OreId } from 'oreid-js';
import { OreIdWebWidget } from "oreid-webwidget";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: '',
      isLoggedIn: false,
      oreIdResult: '',
      signResults: '',
      userData: {},
    };
    this.handleSubmit = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  REACT_APP_OREID_APP_ID = "demo_0097ed83e0a54e679ca46d082ee0e33a"
  REACT_APP_OREID_API_KEY = "demo_k_97b33a2f8c984fb5b119567ca19e4a49"

  // Intialize oreId
  // IMPORTANT - For a production app, you must protect your api key. A create-react-app app will leak the key since it all runs in the browser.
  // To protect the key, you need to set-up a proxy server. See https://github.com/TeamAikon/ore-id-docs/tree/master/examples/react/advanced/react-server
  myOreIdOptions = {
    appName: 'ORE ID Sample App',
    appId: this.REACT_APP_OREID_APP_ID,
    // apiKey: REACT_APP_OREID_API_KEY,
  }

  oreId = new OreId(this.myOreIdOptions);

  webwidget = new OreIdWebWidget(this.oreId, window);

  async componentWillMount() {
    await this.loadUser();
  }

  /* Present a popup for the user to login
    When complete, the accessToken will be updated in oreid.auth */
  async handleLogin(event, provider) {
    event.preventDefault();
    console.log('got to handleLogin')
    this.webwidget.onAuth({
      params: { provider },
      onError: console.error,
      onSuccess: async (data) => { await this.loadUser() },
    });
  }

  /** Remove user info from local storage */
  async handleLogout() {
    this.setState({ errors: {}, userData: {}, isLoggedIn: false });
    this.oreId.logout();
    window.location = window.location.origin; // clear callback url in browser
  }

  /** Load the user from local storage - user info is automatically saved to local storage by oreId.auth.user.getData() */
  async loadUser() {
    if(!this.oreId.auth?.user?.isLoggedIn) return
    let { user } = this.oreId.auth
    await user.getData()
    this.setState({ userData: user.data, isLoggedIn: true });
  }

  createSampleTransactionEos(actor, permission = 'active') {
    const transaction = {
      account: 'demoapphello',
      name: 'hi',
      authorization: [
        {
          actor,
          permission,
        },
      ],
      data: {
        user: actor,
      },
    };
    return transaction;
  }

  renderLoggedIn() {
    const { accountName, email, name, picture, username } = this.state.userData;
    return (
      <div style={{ marginTop: 50, marginLeft: 40 }}>
        <h4>User Info</h4>
        <img
          src={picture}
          style={{ width: 100, height: 100, paddingBottom: 30 }}
          alt={'user'}
        />
        <br />
        OreId account: {accountName}
        <br />
        name: {name}
        <br />
        username: {username}
        <br />
        email: {email}
        <br />
        <div className="App-success">{this?.state?.signResults}</div>
        <LoginButton
          provider="oreid"
          text="Sign with OreID"
          onClick={e => this.handleSign()}
        />
        <br />
        <button onClick={this.handleLogout}> Logout </button>
      </div>
    );
  }

  async handleSign() {
		const userData = this.oreId.auth.user.data
    this.setState({ errors: null });

    const signWithChainNetwork = 'eos_kylin';
    const signingAccount = userData.chainAccounts.find(ca => ca.chainNetwork === signWithChainNetwork)

    // Compose transaction contents
		const transactionBody = this.createSampleTransactionEos(signingAccount.chainAccount, signingAccount.defaultPermission?.name)

		const transaction = await this.oreId.createTransaction({
			chainAccount: signingAccount.chainAccount,
			chainNetwork: signingAccount.chainNetwork,
			transaction: transactionBody,
			signOptions: { 
        broadcast: true,
        returnSignedTransaction: false, 
      },
		});

		this.webwidget.onSign({
			transaction,
      onError: ({ errors }) => {
        this.setState({ errors });
      },
      onSuccess: ({ data }) => {
        this.setState({ oreIdResult: JSON.stringify(data, null, '\t') });
      }
		});
  }

  renderLoggedOut() {
    return (
      <div>
        <LoginButton
          provider="facebook"
          onClick={e => this.handleLogin(e, 'facebook')}
        />
        <LoginButton
          provider="google"
          onClick={e => this.handleLogin(e, 'google')}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.state.isLoggedIn ? (
            <div>{this.renderLoggedIn()} </div>
          ) : (
            <div>{this.renderLoggedOut()} </div>
          )}
          {this.state.errors && (
            <div className="App-error">Error: {this.state.errors}</div>
          )}
          {this.state?.oreIdResult && (
            <div className="App-success">{this?.state?.oreIdResult}</div>
          )}
        </header>
      </div>
    );
  }
}

export default App;
