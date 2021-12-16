import dotenv from 'dotenv';
import React, { Component } from 'react';
import LoginButton from 'oreid-login-button';
import { OreId } from 'oreid-js';
import { signTransaction } from './eos';
import {
  ABI,
  addEthForGas,
  init,
  getGasParams,
  transferErc20Token,
  getEthBalance,
  getErc20Balance
} from './eth';
import { encode as base64Encode } from 'base-64';
import algoSignerProvider from 'eos-transit-algosigner-provider';
import scatterProvider from 'eos-transit-scatter-provider';
import OreIdWebWidget from 'oreid-react-web-widget';
// import ledgerProvider from 'eos-transit-ledger-provider';
import lynxProvider from 'eos-transit-lynx-provider';
import meetoneProvider from 'eos-transit-meetone-provider';
import tokenpocketProvider from 'eos-transit-tokenpocket-provider';
import whalevaultProvider from 'eos-transit-whalevault-provider';
import simpleosProvider from 'eos-transit-simpleos-provider';
import web3Provider from 'eos-transit-web3-provider';
import walletconnectProvider from 'eos-transit-walletconnect-provider';
import {
  EOS_CHAIN_NETWORK,
  ERC20_FUNDING_AMOUNT,
  ERC20_TRANSFER_AMOUNT,
  ETH_TRANSFER_AMOUNT,
  ALGO_CHAIN_NETWORK,
  ETH_CHAIN_NETWORK
} from './constants';
import { composeAlgorandSampleTransaction } from './algorand';

dotenv.config();

const {
  REACT_APP_OREID_APP_ID: appId, // Provided when you register your app
  REACT_APP_OREID_API_KEY: apiKey, // Provided when you register your app
  REACT_APP_OREID_SERVICE_KEY: serviceKey, // Optional - required for some advanced features including autoSign and custodial accounts
  REACT_APP_AUTH_CALLBACK: authCallbackUrl, // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_SIGN_CALLBACK: signCallbackUrl, // The url called by the server when transaction signing flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_OREID_URL: oreIdUrl, // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR: backgroundColor, // Background color shown during login flow
  REACT_APP_FIRST_AUTH_ACCOUNT_NAME: firstAuthAccount, // First auth account for ore_test
  REACT_APP_FIRST_AUTH_KEY: firstAuthKey,
  REACT_APP_ETHEREUM_CONTRACT_ADDRESS: ethereumContractAddress,
  REACT_APP_ETHEREUM_CONTRACT_ACCOUNT_ADDRESS: ethereumContractAccountAddress,
  REACT_APP_ETHEREUM_CONTRACT_ACCOUNT_PRIVATE_KEY: ethereumContractAccountPrivateKey,
  REACT_APP_ETHEREUM_FUNDING_ACCOUNT_ADDRESS: ethereumFundingAddress,
  REACT_APP_ETHEREUM_FUNDING_ACCOUNT_PRIVATE_KEY: ethereumFundingAddressPrivateKey,
  REACT_APP_ALGORAND_EXAMPLE_TO_ADDRESS: transferAlgoToAddress // address of account to send Algos to (for sample transaction)
} = process.env;

let eosTransitWalletProviders = [
  scatterProvider(),
  lynxProvider(),
  meetoneProvider(),
  tokenpocketProvider(),
  whalevaultProvider(),
  simpleosProvider(),
  algoSignerProvider(),
  web3Provider(),
  walletconnectProvider()
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      userInfo: {},
      firstAuth: false,
      sendEthForGas: false,
      currentSignOptions: {},
      showWidget: false,
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleSignButton = this.handleSignButton.bind(this);
    this.toggleFirstAuth = this.toggleFirstAuth.bind(this);
    this.toggleSendEthForGas = this.toggleSendEthForGas.bind(this);
  }

  // called by library to set local busy state
  setBusyCallback = (isBusy, isBusyMessage) => {
    this.setState({ isBusy, isBusyMessage });
  };

  // intialize oreId
  oreId = new OreId({
    appName: 'ORE ID Sample App',
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
    const { firstAuth, sendEthForGas, userInfo } = this.state;
    let { accountName } = userInfo;
    provider = provider || 'oreid'; // default to ore id
    await this.handleSignSampleTransaction(
      provider,
      accountName,
      chainAccount,
      chainNetwork,
      permission,
      firstAuth,
      sendEthForGas
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

  async handleLogin(provider, chainNetwork = EOS_CHAIN_NETWORK) {
    try {
      this.clearErrors();
      let loginResponse = await this.oreId.login({ provider, chainNetwork });
      // if the login responds with a loginUrl, then redirect the browser to it to start the user's OAuth login flow
      let { isLoggedIn, account, loginUrl } = loginResponse;
      if (loginUrl) {
        // redirect browser to loginURL
        window.location = loginUrl;
      }
      this.setState({ userInfo: { accountName: account }, isLoggedIn, loggedProvider: provider });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  getChainUrl(chainNetwork) {
    switch (chainNetwork) {
    case 'ore_test':
      return 'https://ore-staging.openrights.exchange:443';
    case 'eos_kylin':
      return 'https://api.kylin.alohaeos.com:443';
    case 'eos_jungle':
      return 'https://jungle2.cryptolions.io:443';
    case 'eos_main':
      return 'https://api.eosn.io:443';
    case 'eth_ropsten':
      return 'https://ropsten.infura.io/v3/a069a5004f2e4545a03e5c31285a3945';
    default:
      return '';
    }
  }

  getChainType(chainNetwork) {
    switch (chainNetwork) {
    case 'algo_main':
    case 'algo_test':
    case 'algo_beta':
      return 'algo';
    case 'ore_test':
    case 'eos_kylin':
    case 'eos_jungle':
    case 'eos_main':
      return 'eos';
    case 'eth_ropsten':
    case 'eth_main':
      return 'eth';
    default:
      return '';
    }
  }

  // if oreid is signing the transaction, it expects the tx action to be wrapped in an array called actions
  wrapTxActionArrayForOreId(provider, transaction) {
    // wrap transaction in actions array for oreid
    if (provider === 'oreid') {
      transaction = {
        actions: [transaction]
      };
    }
    return transaction;
  }

  async handleSignSampleTransaction(
    provider,
    account,
    chainAccount,
    chainNetwork,
    permission,
    firstAuth = false,
    sendEthForGas
  ) {
    try {
      let signOptions = await this.prepareSignOptions(chainNetwork, chainAccount, permission, provider, sendEthForGas, firstAuth, account);

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
          signedTransaction: JSON.stringify(signedTransaction)
        });
      }
      if (transactionId) this.setState({ transactionId });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  async prepareSignOptions(chainNetwork, chainAccount, permission, provider, sendEthForGas, firstAuth, account) {
    let transaction = null;
    let signedTransactionToSend = null;

    if (this.getChainType(chainNetwork) === 'algo') {
      transaction = this.createSampleTransactionAlgorand(
        chainAccount,
        permission
      );
      transaction = this.wrapTxActionArrayForOreId(provider, transaction);
    }

    if (this.getChainType(chainNetwork) === 'eth') {
      if (sendEthForGas) {
        await this.fundEthereumAccountIfNeeded(chainAccount, chainNetwork);
      }
      transaction = this.createSampleTransactionEthereum(
        chainAccount,
        permission
      );
      transaction = this.wrapTxActionArrayForOreId(provider, transaction);
    }

    if (this.getChainType(chainNetwork) === 'eos') {
      if (firstAuth) {
        signedTransactionToSend = this.createFirstAuthSampleTransactionEos(
          firstAuthAccount,
          chainAccount,
          permission
        );
        const chainUrl = this.getChainUrl(chainNetwork);
        transaction = await signTransaction(
          signedTransactionToSend,
          chainUrl,
          firstAuthKey
        );
      } else {
        transaction = this.createSampleTransactionEos(
          chainAccount,
          permission
        );
      }
    }

    // this.clearErrors();gi
    let signOptions = {
      provider: provider || '',
      account: account || '',
      broadcast: true,
      chainAccount: chainAccount || '',
      chainNetwork: chainNetwork || '',
      state: 'abc',
      transaction,
      accountIsTransactionPermission: false,
      returnSignedTransaction: true,
      preventAutoSign: false // prevent auto sign even if transaction is auto signable
    };
    return signOptions;
  }

  createSampleTransactionEos(actor, permission = 'active') {
    const transaction = {
      account: 'demoapphello',
      name: 'hi',
      authorization: [
        {
          actor,
          permission
        }
      ],
      data: {
        user: actor
      }
    };
    return transaction;
  }

  createFirstAuthSampleTransactionEos(
    payer,
    actor,
    permission = 'active',
    payerPermission = 'active'
  ) {
    const transaction = {
      actions: [
        {
          account: 'demoapphello',
          name: 'hi',
          authorization: [
            {
              actor: payer,
              permission: payerPermission
            },
            {
              actor,
              permission
            }
          ],
          data: {
            user: actor
          }
        }
      ]
    };
    return transaction;
  }

  createSampleTransactionEthereum(actor, permission = 'active') {
    return {
      from: actor,
      to: ethereumContractAddress,
      contract: {
        abi: ABI,
        parameters: [ethereumContractAccountAddress, ERC20_TRANSFER_AMOUNT],
        method: 'transfer'
      },
      gasLimit: 145000
    };
  }

  createSampleTransactionAlgorand(account) {
    return composeAlgorandSampleTransaction(account, transferAlgoToAddress);
  }

  async fundEthereumAccountIfNeeded(chainAccount, chainNetwork) {
    const chainUrl = this.getChainUrl(chainNetwork);
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

  async toggleFirstAuth() {
    this.setState({ firstAuth: !this.state.firstAuth });
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
      const { account, errors, state } = this.oreId.handleAuthResponse(url);
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
      const { signedTransaction, state, transactionId, errors } = this.oreId.handleSignResponse(url);
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
      transactionId,
      showWidget
    } = this.state;
    return (
      <div>
        <div>
          {!isLoggedIn && this.renderLoginButtons()}
          {isLoggedIn && this.renderUserInfo()}
          {isLoggedIn && this.renderSigningOptions()}
          {isLoggedIn && this.renderFirstAuthorizerCheckBox()}
          {isLoggedIn && this.renderEthereumGasCheckBox()}
          {isLoggedIn && showWidget && (
            <OreIdWebWidget
              show={this.state.showWidget}
              oreIdOptions={{
                appName: "Demo app",
                appId: process.env.REACT_APP_OREID_APP_ID,
                oreIdUrl,
                accessToken: this.oreId.accessToken
              }}
              action={{
                name: 'sign',
                params: this.state.currentSignOptions
              }}
              onSuccess={result => {
                this.setState({
                  signedTransaction: JSON.stringify(result.data.signedTransaction),
                });
                this.setState({showWidget: false})
              }}
              onError={result => {
                console.log(result, this.state.currentSignOptions);
                if (typeof result.errors === 'string') {
                  this.setState({ errorMessage: result.errors.replace(', ') });
                } else {
                  this.setState({ errorMessage: result.errors.join(', ') });
                }
                this.setState({ showWidget: false })
              }}
            />
          )}
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
      <div style={{marginTop: 50, marginLeft: 20}}>
        <h3>Sign sample transaction with one of your keys</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {this.renderSignButtons(this.permissionsToRender)}
        </div>
      </div>
    );
  }

  renderFirstAuthorizerCheckBox() {
    let { firstAuth } = this.state;

    return (
      <div style={{ marginLeft: 20, marginTop: 20 }}>
        <input
          id="eos"
          type="checkbox"
          onChange={this.toggleFirstAuth}
          checked={firstAuth}
        />
        <label for="eos" style={{ paddingLeft: 10 }}>
          {'For Eos - Check the box above if you want your transaction\'s CPU and NET to be payed by App.'}
        </label>
      </div>
    );
  }

  renderEthereumGasCheckBox() {
    let { sendEthForGas } = this.state;
    return (
      <div style={{ marginLeft: 20, marginTop: 20 }}>
        <input
          id="eth"
          type="checkbox"
          onChange={this.toggleSendEthForGas}
          checked={sendEthForGas}
        />
        <label for="eth" style={{ paddingLeft: 10 }}>
          For Ethereum - Check the box above if you want to automatically send Eth for gas required for sample transaction if needed
        </label>
      </div>
    );
  }

  renderDiscoverOptions() {
    this.walletButtons = [
      { provider: 'scatter', chainNetwork: EOS_CHAIN_NETWORK },
      { provider: 'ledger', chainNetwork: EOS_CHAIN_NETWORK },
      { provider: 'lynx', chainNetwork: EOS_CHAIN_NETWORK },
      { provider: 'meetone', chainNetwork: EOS_CHAIN_NETWORK },
      { provider: 'tokenpocket', chainNetwork: EOS_CHAIN_NETWORK },
      { provider: 'portis', chainNetwork: EOS_CHAIN_NETWORK },
      { provider: 'whalevault', chainNetwork: EOS_CHAIN_NETWORK },
      { provider: 'simpleos', chainNetwork: EOS_CHAIN_NETWORK },
      { provider: 'keycat', chainNetwork: EOS_CHAIN_NETWORK },
      { provider: 'algosigner', chainNetwork: ALGO_CHAIN_NETWORK },
      { provider: 'web3', chainNetwork: ETH_CHAIN_NETWORK }
    ];
    return (
      <div style={{marginTop: 50, marginLeft: 20}}>
        <h3>Or discover a key in your wallet</h3>
        <div style={{ display: 'flex' }}>
          {this.renderWalletDiscoverButtons(this.walletButtons)}
        </div>
      </div>
    );
  }

  async handleOpenWidget(permissionIndex) {
    let {
      chainAccount,
      chainNetwork,
      permission,
    } = this.permissionsToRender[permissionIndex] || {};
    const { firstAuth, sendEthForGas, userInfo, loggedProvider } = this.state;
    let { accountName } = userInfo;
    const provider = loggedProvider || 'google';
    const signOptions =  await this.prepareSignOptions(
      chainNetwork,
      chainAccount,
      permission,
      provider,
      sendEthForGas,
      firstAuth,
      accountName,
    );
    this.setState({
      currentSignOptions: {
        ...signOptions,
        accessToken: this.oreId.accessToken,
        transaction: base64Encode(JSON.stringify(signOptions.transaction))
      },
      showWidget: true
    });
  }

  // render one sign transaction button for each chain
  renderSignButtons = (permissions) => permissions.map((permission, index) => {
    let provider = permission.externalWalletType || 'oreid';
    return (
      <div key={index} style={{
        width: '200px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        margin: '5px',
        padding: '5px',
        border: '1px solid lightgray',
        borderRadius: '10px'
      }}>
        <div>
          <strong>Chain:</strong> {permission.chainNetwork}
        </div>
        <div style={{
          width: '100%',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}>
          <strong>Account:</strong>{permission.chainAccount}
        </div>
        <div>
          <strong>Permission:</strong> {permission.permission}
        </div>
        <LoginButton
          provider={provider}
          data-tag={index}
          buttonStyle={{
            margin: '2px'
          }}
          text="Sign with callback"
          onClick={() => {
            this.handleSignButton(index);
          }}
        >Sign Sample Transaction with {provider}</LoginButton>
        <LoginButton
          provider={provider}
          text="Sign with Widget"
          buttonStyle={{
            margin: '2px'
          }}
          onClick={() => this.handleOpenWidget(index)}
        />
      </div>
    );
  });

  // render one sign transaction button for each chain
  renderWalletDiscoverButtons = (walletButtons) => walletButtons.map((wallet, index) => {
    let { provider } = wallet;
    return (
      <div style={{ margin: '5px' }} key={index}>
        <LoginButton
          provider={provider}
          data-tag={index}
          buttonStyle={{
            width: '100%',
            minHeight: '75px'
          }}
          text={`${provider}`}
          onClick={() => {
            this.handleWalletDiscoverButton(index);
          }}
        >{`${provider}`}</LoginButton>
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
        <LoginButton
          provider="scatter"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('scatter')}
        />
        <LoginButton
          provider="ledger"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('ledger')}
        />
        <LoginButton
          provider="meetone"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('meetone')}
        />
        <LoginButton
          provider="lynx"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('lynx')}
        />
        <LoginButton
          provider="portis"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('portis')}
        />
        <LoginButton
          provider="whalevault"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('whalevault')}
        />
        <LoginButton
          provider="simpleos"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('simpleos')}
        />
        <LoginButton
          provider="keycat"
          buttonStyle={buttonStyle}
          onClick={() => this.handleLogin('keycat')}
        />
      </div>
    );
  }
}

export default App;
