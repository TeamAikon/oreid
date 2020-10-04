import dotenv from 'dotenv';
import React, { Component } from 'react';
import LoginButton from 'oreid-login-button';
import algoSignerProvider from 'eos-transit-algosigner-provider';
import { OreId } from 'oreid-js';
import {
  getMultisigChainAccountsForTransaction,
  composeAlgorandSampleTransaction
} from './algorand';

dotenv.config();

export const ALGO_CHAIN_NETWORK = 'algo_test';

const {
  REACT_APP_OREID_APP_ID: appId, // Provided when you register your app
  REACT_APP_OREID_API_KEY: apiKey, // Provided when you register your app
  REACT_APP_OREID_SERVICE_KEY: serviceKey, // Optional - required for some advanced features including autoSign and custodial accounts
  REACT_APP_AUTH_CALLBACK: authCallbackUrl, // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_SIGN_CALLBACK: signCallbackUrl, // The url called by the server when transaction signing flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_OREID_URL: oreIdUrl, // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR: backgroundColor, // Background color shown during login flow
  REACT_APP_ALGORAND_EXAMPLE_TO_ADDRESS: transferAlgoToAddress, // address of account to send Algos to (for sample transaction)
  REACT_APP_ALGORAND_ALGO_FUNDING_ADDRESS: transferAlgoFromFundingAddress, // address of account with Algos in it (for sample transaction)
  REACT_APP_ALGORAND_ALGO_FUNDING_PRIVATE_KEY: transferAlgoFromFundingPrivateKey // PK of account with Algos in it (used to send to other account)
} = process.env;

let eosTransitWalletProviders = [algoSignerProvider()];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      userInfo: {}
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleSignButton = this.handleSignButton.bind(this);
  }

  // called by library to set local busy state
  setBusyCallback = (isBusy, isBusyMessage) => {
    this.setState({ isBusy, isBusyMessage });
  };

  // intialize oreId
  oreId = new OreId({
    appName: 'ORE ID Algorand Sample App',
    appId,
    apiKey,
    serviceKey,
    oreIdUrl,
    authCallbackUrl,
    signCallbackUrl,
    backgroundColor,
    eosTransitWalletProviders,
    setBusyCallback: this.setBusyCallback
  });

  async componentWillMount() {
    this.loadUserFromLocalState();
    this.handleAuthCallback();
    this.handleSignCallback();
  }

  async loadUserFromLocalState() {
    const userInfo = (await this.oreId.getUser()) || {};
    if ((userInfo || {}).accountName) {
      this.setState({ userInfo, isLoggedIn: true });
    }
  }

  async loadUserFromApi(account) {
    try {
      const userInfo = (await this.oreId.getUserInfoFromApi(account)) || {};
      this.setState({ userInfo, isLoggedIn: true });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  clearErrors() {
    this.setState({
      errorMessage: null,
      signedTransaction: null,
      signState: null
    });
  }

  handleLogout() {
    this.clearErrors();
    this.setState({ userInfo: {}, isLoggedIn: false });
    this.oreId.logout(); // clears local user state (stored in local storage or cookie)
  }

  async handleSignButton(permissionIndex) {
    this.clearErrors();
    let {
      chainAccount,
      chainNetwork,
      permission,
      externalWalletType: provider
    } = this.permissionsToRender[permissionIndex] || {};
    const { userInfo } = this.state;
    let { accountName } = userInfo;
    provider = provider || 'oreid'; // default to ore id
    await this.handleSignSampleTransaction(
      provider,
      accountName,
      chainAccount,
      chainNetwork,
      permission
    );
  }

  async handleLogin(provider) {
    let chainNetwork = ALGO_CHAIN_NETWORK;
    try {
      this.clearErrors();
      let loginResponse = await this.oreId.login({ provider, chainNetwork });
      // if the login responds with a loginUrl, then redirect the browser to it to start the user's OAuth login flow
      let { isLoggedIn, account, loginUrl } = loginResponse;
      if (loginUrl) {
        // redirect browser to loginURL
        window.location = loginUrl;
      }
      this.setState({ userInfo: { accountName: account }, isLoggedIn });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  async getChainUrl(chainNetwork) {
    const { host, protocol } = await this.oreId.getNetworkConfig(chainNetwork);
    return `${protocol}://${host}`;
  }

  async handleSignSampleTransaction(
    provider,
    account,
    chainAccount,
    chainNetwork,
    permission
  ) {
    try {
      let transaction = null;
      transaction = await composeAlgorandSampleTransaction(
        chainAccount,
        transferAlgoToAddress
      );

      // wrap transaction in actions array for oreid
      if (provider === 'oreid') {
        transaction = {
          actions: [transaction]
        };
      }

      console.log('transaction:', transaction);

      const multiSigChainAccounts = getMultisigChainAccountsForTransaction(
        this.state.userInfo,
        chainAccount
      );

      // this.clearErrors();
      let signOptions = {
        provider: provider || '', // wallet type (e.g. 'scatter' or 'oreid')
        account: account || '',
        broadcast: true, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
        chainAccount: chainAccount || '',
        chainNetwork: chainNetwork || '',
        state: 'abc', // anything you'd like to remember after the callback
        transaction,
        returnSignedTransaction: false,
        preventAutoSign: false, // prevent auto sign even if transaction is auto signable
        multiSigChainAccounts
      };

      let signResponse = await this.oreId.sign(signOptions);
      // if the sign responds with a signUrl, then redirect the browser to it to call the signing flow
      let { signUrl, signedTransaction, state, transactionId } =
        signResponse || {};
      if (signUrl) {
        // redirect browser to signUrl
        window.location = signUrl;
      }
      if (signedTransaction) {
        this.setState({
          signedTransaction: JSON.stringify(signedTransaction),
          state
        });
      }
      if (transactionId) this.setState({ transactionId });
    } catch (error) {
      this.setState({ errorMessage: error.message || error });
    }
  }

  /* Handle the authCallback coming back from ORE-ID with an "account" parameter indicating that a user has logged in */
  async handleAuthCallback() {
    const url = window.location.href;
    if (/authcallback/i.test(url)) {
      const { account, errors, state } = await this.oreId.handleAuthResponse(
        url
      );
      if (state) console.log(`state returned with request:${state}`);
      if (!errors) {
        this.loadUserFromApi(account);
      }
    }
  }

  /* Handle the signCallback coming back from ORE-ID with a "signedTransaction" parameter providing the transaction object with signatures attached */
  async handleSignCallback() {
    const url = window.location.href;
    if (/signcallback/i.test(url)) {
      const signResponse = await this.oreId.handleSignResponse(url);
      const { signedTransaction, state, transactionId, errors } = signResponse;
      if (!errors) {
        if (state) this.setState({ signState: state });
        if (signedTransaction) {
          this.setState({
            signedTransaction: JSON.stringify(signedTransaction)
          });
        }
        if (transactionId) {
          this.setState({ transactionId: JSON.stringify(transactionId) });
        }
      } else {
        this.setState({ errorMessage: errors.join(', ') });
      }
    }
  }

  render() {
    let {
      errorMessage,
      isBusy,
      isBusyMessage,
      isLoggedIn,
      signedTransaction,
      signState,
      transactionId
    } = this.state;
    return (
      <div>
        <div>
          {!isLoggedIn && this.renderLoginButtons()}
          {isLoggedIn && this.renderUserInfo()}
          {isLoggedIn && this.renderSigningOptions()}
        </div>
        <h3 style={{ color: 'green', margin: '50px' }}>
          {isBusy && (isBusyMessage || 'working...')}
        </h3>
        <div style={{ color: 'red', margin: '50px' }}>
          {errorMessage && errorMessage}
        </div>
        <div
          id="transactionId"
          style={{ color: 'blue', marginLeft: '50px', marginTop: '50px' }}
        >
          <p className="log">
            {transactionId && `Returned transactionId: ${transactionId}`}
          </p>
        </div>
        <div
          id="signedTransaction"
          style={{ color: 'blue', marginLeft: '50px', marginTop: '10px' }}
        >
          <p className="log">
            {signedTransaction &&
              `Returned signed transaction: ${signedTransaction}`}
          </p>
        </div>
        <div
          id="signState"
          style={{ color: 'blue', marginLeft: '50px', marginTop: '10px' }}
        >
          <p className="log">
            {signState && `Returned state param: ${signState}`}
          </p>
        </div>
        {isLoggedIn && this.renderDiscoverOptions()}
      </div>
    );
  }

  renderUserInfo() {
    const { accountName, email, name, picture, username } = this.state.userInfo;
    return (
      <div style={{ marginTop: 50, marginLeft: 40 }}>
        <h3>User Info</h3>
        <img src={picture} style={{ width: 50, height: 50 }} alt={'user'} />
        <br />
        accountName: {accountName}
        <br />
        name: {name}
        <br />
        username: {username}
        <br />
        email: {email}
        <br />
        <button
          onClick={this.handleLogout}
          style={{
            marginTop: 20,
            padding: '10px',
            backgroundColor: '#FFFBE6',
            borderRadius: '5px'
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  renderSigningOptions() {
    let { permissions } = this.state.userInfo;
    this.permissionsToRender = (permissions || []).slice(0);
    return (
      <div>
        <div style={{ marginTop: 50, marginLeft: 20 }}>
          <h3>Sign sample transaction with one of your keys</h3>
          <ul>{this.renderSignButtons(this.permissionsToRender)}</ul>
        </div>
      </div>
    );
  }

  // render one sign transaction button for each chain
  renderSignButtons = (permissions) => permissions
    .filter((permission) => permission.chainNetwork.startsWith('algo'))
    .map((permission, index) => {
      let provider = permission.externalWalletType || 'oreid';
      return (
        <div style={{ alignContent: 'center' }} key={index}>
          <LoginButton
            provider={provider}
            data-tag={index}
            buttonStyle={{
              width: 225,
              marginLeft: -20,
              marginTop: 20,
              marginBottom: 10
            }}
            text={`Sign with ${provider}`}
            onClick={() => {
              this.handleSignButton(index);
            }}
          >{`Sign Sample Transaction with ${provider}`}</LoginButton>
          {`Chain:${permission.chainNetwork} ---- Account:${permission.chainAccount} ---- Permission:${permission.permission}`}
        </div>
      );
    });

  renderLoginButtons() {
    const buttonStyle = { width: 200, marginTop: '24px' };
    return (
      <div>
        <LoginButton
          provider="apple"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('apple')}
        />
        <LoginButton
          provider="facebook"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('facebook')}
        />
        <LoginButton
          provider="twitter"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('twitter')}
        />
        <LoginButton
          provider="github"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('github')}
        />
        <LoginButton
          provider="twitch"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('twitch')}
        />
        <LoginButton
          provider="line"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('line')}
        />
        <LoginButton
          provider="kakao"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('kakao')}
        />
        <LoginButton
          provider="linkedin"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('linkedin')}
        />
        <LoginButton
          provider="google"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('google')}
        />
        <LoginButton
          provider="email"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('email')}
        />
        <LoginButton
          provider="phone"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('phone')}
        />
      </div>
    );
  }

  // render one sign transaction button for each chain
  renderWalletDiscoverButtons = (walletButtons) => walletButtons.map((wallet, index) => {
    let { provider } = wallet;
    return (
      <div style={{ alignContent: 'center' }} key={index}>
        <LoginButton
          provider={provider}
          data-tag={index}
          buttonStyle={{
            width: 80,
            marginLeft: -20,
            marginTop: 20,
            marginBottom: 10
          }}
          text={`${provider}`}
          onClick={() => {
            this.handleWalletDiscoverButton(index);
          }}
        >{`${provider}`}</LoginButton>
      </div>
    );
  });

  renderDiscoverOptions() {
    this.walletButtons = [
      { provider: 'algosigner', chainNetwork: ALGO_CHAIN_NETWORK }
    ];
    return (
      <div>
        <div style={{ marginTop: 50, marginLeft: 20 }}>
          <h3 style={{ marginTop: 50 }}>Or discover a key in your wallet</h3>
          <ul>{this.renderWalletDiscoverButtons(this.walletButtons)}</ul>
        </div>
      </div>
    );
  }

  async handleWalletDiscoverButton(permissionIndex) {
    try {
      this.clearErrors();
      let { provider, chainNetwork } =
        this.walletButtons[permissionIndex] || {};
      let { accountName } = this.state.userInfo;

      if (!this.oreId.canDiscover(provider)) {
        console.log(
          'Provider doesn\'t support discover, so discover function will call wallet provider\'s login instead.'
        );
      }
      await this.oreId.discover({
        provider,
        chainNetwork,
        oreAccount: accountName
      });
      this.loadUserFromApi(this.state.userInfo.accountName); // reload user from ore id api - to show new keys discovered
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }
}

export default App;
