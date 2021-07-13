import dotenv from 'dotenv';
import React, { Component } from 'react';
import LoginButton from 'oreid-login-button';
import { OreId } from 'oreid-js';
import web3Provider from 'eos-transit-web3-provider';
import web3 from 'web3';
import {
  ABI,
  addEthForGas,
  init,
  getGasParams,
  transferErc20Token,
  getEthBalance,
  getErc20Balance
} from './eth';

import {
  EOS_CHAIN_NETWORK,
  ERC20_FUNDING_AMOUNT,
  ERC20_TRANSFER_AMOUNT,
  ETH_TRANSFER_AMOUNT,
  ETH_CHAIN_NETWORK
} from './constants';

dotenv.config();

const {
  REACT_APP_OREID_APP_ID: appId, // Provided when you register your app
  REACT_APP_OREID_API_KEY: apiKey, // Provided when you register your app
  REACT_APP_OREID_SERVICE_KEY: serviceKey, // Optional - required for some advanced features including autoSign and custodial accounts
  REACT_APP_AUTH_CALLBACK: authCallbackUrl, // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_SIGN_CALLBACK: signCallbackUrl, // The url called by the server when transaction signing flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_OREID_URL: oreIdUrl, // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR: backgroundColor, // Background color shown during login flow
  REACT_APP_ETHEREUM_CONTRACT_ADDRESS: ethereumContractAddress,
  REACT_APP_ETHEREUM_CONTRACT_ACCOUNT_ADDRESS: ethereumContractAccountAddress,
  REACT_APP_ETHEREUM_CONTRACT_ACCOUNT_PRIVATE_KEY:
    ethereumContractAccountPrivateKey,
  REACT_APP_ETHEREUM_FUNDING_ACCOUNT_ADDRESS: ethereumFundingAddress,
  REACT_APP_ETHEREUM_FUNDING_ACCOUNT_PRIVATE_KEY:
    ethereumFundingAddressPrivateKey
} = process.env;

const eosTransitWalletProviders = [web3Provider()]; // Wallet plug-in

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      userInfo: {},
      sendEthForGas: false
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleSignButton = this.handleSignButton.bind(this);
    this.toggleSendEthForGas = this.toggleSendEthForGas.bind(this);
    this.signStringWithWeb3 = this.signStringWithWeb3.bind(this);
    this.sendEthWithWeb3 = this.sendEthWithWeb3.bind(this);
    this.signContractTransactionWithWeb3 =
      this.signContractTransactionWithWeb3.bind(this);
  }

  // called by library to set local busy state
  setBusyCallback = (isBusy, isBusyMessage) => {
    this.setState({ isBusy, isBusyMessage });
  };

  // intialize oreId
  oreId = new OreId({
    appName: 'ORE ID Ethereum Sample App',
    appId,
    apiKey,
    serviceKey,
    oreIdUrl,
    authCallbackUrl,
    signCallbackUrl,
    backgroundColor,
    setBusyCallback: this.setBusyCallback,
    eosTransitWalletProviders
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
      signState: null,
      signedString: null
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
    const { sendEthForGas, userInfo } = this.state;
    let { accountName } = userInfo;
    provider = provider || 'oreid'; // default to ore id
    await this.handleSignSampleTransaction(
      provider,
      accountName,
      chainAccount,
      chainNetwork,
      permission,
      sendEthForGas
    );
  }

  async handleLogin(provider) {
    let chainNetwork = EOS_CHAIN_NETWORK;
    if (provider === 'web3') {
      chainNetwork = ETH_CHAIN_NETWORK;
    }
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
    permission,
    sendEthForGas
  ) {
    try {
      let transaction = null;
      if (sendEthForGas) {
        await this.fundEthereumAccountIfNeeded(chainAccount, chainNetwork);
      }
      transaction = this.createEthereumSampleTransaction(
        chainAccount,
        permission
      );

      // this.clearErrors();
      let signOptions = {
        provider: provider || '', // wallet type (e.g. 'scatter' or 'oreid')
        account: account || '',
        broadcast: false, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
        chainAccount: chainAccount || '',
        chainNetwork: chainNetwork || '',
        state: 'abc', // anything you'd like to remember after the callback
        transaction,
        returnSignedTransaction: true,
        preventAutoSign: false // prevent auto sign even if transaction is auto signable
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
      this.setState({ errorMessage: error.message });
    }
  }

  createEthereumSampleTransaction(actor, permission = 'active') {
    const transaction = {
      to: ethereumContractAddress,
      contract: {
        abi: ABI,
        parameters: [ethereumContractAccountAddress, ERC20_TRANSFER_AMOUNT],
        method: 'transfer'
      }
    };
    if (actor) transaction.from = actor; // from is optional
    return transaction;
  }

  async fundEthereumAccountIfNeeded(chainAccount, chainNetwork) {
    const chainUrl = await this.getChainUrl(chainNetwork);
    const web3 = await init(chainUrl);
    const { gasPrice, gasLimit } = await getGasParams(
      chainAccount,
      web3,
      this.setBusyCallback
    );
    const currentEthBalance = await getEthBalance(
      chainAccount,
      web3,
      this.setBusyCallback
    );
    const currentErc20Balance = await getErc20Balance(
      ethereumContractAddress,
      chainAccount,
      web3,
      this.setBusyCallback
    );
    if (web3.utils.toWei(currentEthBalance, 'ether') < gasPrice * gasLimit) {
      await addEthForGas(
        ethereumFundingAddress,
        chainAccount,
        ETH_TRANSFER_AMOUNT,
        ethereumFundingAddressPrivateKey,
        web3,
        this.setBusyCallback
      );
    }
    if (parseInt(currentErc20Balance) < ERC20_TRANSFER_AMOUNT) {
      await transferErc20Token(
        ethereumContractAddress,
        ethereumContractAccountAddress,
        chainAccount,
        ERC20_FUNDING_AMOUNT,
        ethereumContractAccountPrivateKey,
        web3,
        this.setBusyCallback
      );
    }
  }

  async toggleSendEthForGas() {
    this.setState({ sendEthForGas: !this.state.sendEthForGas });
  }

  /*
   Handle the authCallback coming back from ORE-ID with an "account" parameter indicating that a user has logged in
  */
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

  /*
   Handle the signCallback coming back from ORE-ID with a "signedTransaction" parameter providing the transaction object with signatures attached
  */
  async handleSignCallback() {
    const url = window.location.href;
    if (/signcallback/i.test(url)) {
      const { signedTransaction, state, transactionId, errors } =
        await this.oreId.handleSignResponse(url);
      if (!errors) {
        if (state) this.setState({ signState: state });
        if (signedTransaction) this.setState({
          signedTransaction: JSON.stringify(signedTransaction)
        });
        if (transactionId) this.setState({ transactionId: JSON.stringify(transactionId) });
      } else {
        this.setState({ errorMessage: errors.join(', ') });
      }
    }
  }

  /** sign a string with web3 - signArbitrary */
  async signStringWithWeb3(params) {
    const { actor } = params;
    try {
      this.clearErrors();
      const provider = 'web3';
      const chainAccount = actor;
      const chainNetwork = ETH_CHAIN_NETWORK;

      const signOptions = {
        provider,
        chainAccount,
        chainNetwork,
        string: 'Hello from ore-id-docs',
        message: null
      };

      const signResponse = await this.oreId.signString(signOptions);

      if (signResponse) {
        const { signedString } = signResponse;
        this.setState({
          signedString: JSON.stringify(signedString)
        });
      }
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  /** send ether with web3 */
  async sendEthWithWeb3(params) {
    const { actor, sendEthForGas } = params;
    try {
      this.clearErrors();
      const provider = 'web3';
      const chainAccount = actor;
      const chainNetwork = ETH_CHAIN_NETWORK;

      const fromAddress = prompt(
        `Please enter your From address
        \nIf you don't specify from address, The address you're connected to our will connect to will be used instead.
      `
      );

      let toAddress = prompt('Please enter To address', ethereumContractAddress);
      if (!toAddress) return;

      let ethAmount = null;
      ethAmount = prompt('Enter the amount of ETH you want to send:', '.000000000000000001');
      if (!ethAmount) return;
      let transaction = {
        to: toAddress,
        value: web3.utils.toHex(web3.utils.toWei(ethAmount)),
        gasLimit: web3.utils.toHex('1000000')
      };
      if (fromAddress) {
        transaction['from'] = fromAddress;
      }

      const signOptions = {
        provider,
        chainAccount: chainAccount || '',
        chainNetwork: chainNetwork || '',
        transaction,
        returnSignedTransaction: true,
        preventAutoSign: false
      };
      if (sendEthForGas) await this.fundEthereumAccountIfNeeded(chainAccount, chainNetwork);
      let signResponse = await this.oreId.sign(signOptions);

      if (signResponse) {
        const { signedTransaction } = signResponse;
        this.setState({
          signedTransaction: JSON.stringify(signedTransaction)
        });
      }
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  /** sign a sample contract transaction with web3 */
  async signContractTransactionWithWeb3(params) {
    const { actor, sendEthForGas } = params;
    try {
      this.clearErrors();
      const {
        userInfo: { accountName }
      } = this.state;

      const provider = 'web3';
      const chainNetwork = ETH_CHAIN_NETWORK;
      let chainAccount = actor;
      const permission = 'active';

      chainAccount = prompt(
        `Please enter your From address
        \nIf you don't specify from address, The address you're connected to our will connect to will be used instead.
      `, chainAccount
      );

      await this.handleSignSampleTransaction(
        provider,
        accountName,
        chainAccount,
        chainNetwork,
        permission,
        sendEthForGas
      );
    } catch (error) {
      this.setState({ errorMessage: error.message });
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
      signedString,
      transactionId
    } = this.state;
    return (
      <div>
        <div>
          {!isLoggedIn && this.renderLoginButtons()}
          {isLoggedIn && this.renderUserInfo()}
          {isLoggedIn && this.renderSigningOptions()}
          {isLoggedIn && this.renderEthereumGasCheckBox()}
          {isLoggedIn && this.renderWeb3Buttons()}
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
          <p className="log">
            {signedString && `Returned signed string: ${signedString}`}
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

  renderEthereumGasCheckBox() {
    let { sendEthForGas } = this.state;
    return (
      <div style={{ marginLeft: 50, marginTop: 20 }}>
        <input
          type="checkbox"
          onChange={this.toggleSendEthForGas}
          checked={sendEthForGas}
        />
        <p>
          {
            'For Ethereum - Check the box above if you want to automatically send Eth for gas required for sample transaction if needed'
          }
        </p>
      </div>
    );
  }

  // render one sign transaction button for each chain
  renderSignButtons = (permissions) => permissions
    .filter((permission) => permission.chainNetwork.startsWith('eth'))
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

  renderWeb3Buttons() {
    const provider = 'web3' || 'oreid';
    const ethAccount = undefined; // should be set with a specific account, if desired (optional)
    return (
      <div style={{ alignContent: 'center', marginLeft: 60, marginTop: 20, display: 'flex' }}>
        <LoginButton
          provider={provider}
          buttonStyle={{
            width: 225,
            marginLeft: 10,
            marginTop: 20,
            marginBottom: 10
          }}
          text={`Sign String with ${provider}`}
          onClick={() => {
            this.signStringWithWeb3({ actor: ethAccount });
          }}
        />
        <LoginButton
          provider={provider}
          buttonStyle={{
            width: 225,
            marginLeft: 10,
            marginTop: 20,
            marginBottom: 10
          }}
          text={`Send ETH with ${provider}`}
          onClick={() => {
            this.sendEthWithWeb3({ actor: ethAccount, sendEthForGas: this.state?.sendEthForGas });
          }}
        />
        <LoginButton
          provider={provider}
          buttonStyle={{
            width: 225,
            marginLeft: 10,
            marginTop: 20,
            marginBottom: 10
          }}
          text={`Sign Contract Transaction with ${provider}`}
          onClick={() => {
            this.signContractTransactionWithWeb3({ actor: ethAccount, sendEthForGas: this.state?.sendEthForGas });
          }}
        />
      </div>
    );
  }
}

export default App;
