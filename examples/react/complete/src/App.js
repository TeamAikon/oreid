import dotenv from 'dotenv';
import React, { Component } from 'react';
import LoginButton from 'oreid-login-button';
import { OreId, ExternalWalletType, ChainNetwork } from 'oreid-js';
import { defaultOreIdServiceUrl } from 'oreid-js/dist/constants';
import {
  // ABI,
  addEthForGas,
  init,
  getGasParams,
  transferErc20Token,
  getEthBalance,
  getErc20Balance
} from './eth';
// import { encode as base64Encode } from 'base-64';
import algoSignerProvider from 'eos-transit-algosigner-provider';
import scatterProvider from 'eos-transit-scatter-provider';
import { OreIdWebWidget } from "oreid-webwidget";
// import ledgerProvider from 'eos-transit-ledger-provider';
import lynxProvider from 'eos-transit-lynx-provider';
import meetoneProvider from 'eos-transit-meetone-provider';
import tokenpocketProvider from 'eos-transit-tokenpocket-provider';
import whalevaultProvider from 'eos-transit-whalevault-provider';
import simpleosProvider from 'eos-transit-simpleos-provider';
import web3Provider from 'eos-transit-web3-provider';
import walletconnectProvider from 'eos-transit-walletconnect-provider';
import {
  ERC20_FUNDING_AMOUNT,
  ERC20_TRANSFER_AMOUNT,
  ETH_TRANSFER_AMOUNT,
} from './constants';
import { composeAlgorandSampleTransaction } from './algorand';

dotenv.config();

const {
  REACT_APP_OREID_APP_ID: appId = 'demo_0097ed83e0a54e679ca46d082ee0e33a', // Provided when you register your app
  REACT_APP_OREID_API_KEY: apiKey, // Provided when you register your app
  REACT_APP_OREID_SERVICE_KEY: serviceKey, // Optional - required for some advanced features including autoSign and custodial accounts
  REACT_APP_OREID_URL: oreIdUrl = defaultOreIdServiceUrl, // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR: backgroundColor, // Background color shown during login flow
  REACT_APP_ETHEREUM_CONTRACT_ADDRESS: ethereumContractAddress,
  REACT_APP_ETHEREUM_CONTRACT_ACCOUNT_ADDRESS: ethereumContractAccountAddress,
  REACT_APP_ETHEREUM_CONTRACT_ACCOUNT_PRIVATE_KEY: ethereumContractAccountPrivateKey,
  REACT_APP_ETHEREUM_FUNDING_ACCOUNT_ADDRESS: ethereumFundingAddress,
  REACT_APP_ETHEREUM_FUNDING_ACCOUNT_PRIVATE_KEY: ethereumFundingAddressPrivateKey,
  REACT_APP_ALGORAND_EXAMPLE_TO_ADDRESS: transferAlgoToAddress // address of account to send Algos to (for sample transaction)
} = process.env;

const authCallbackUrl = `${window.location.origin}/authcallback`; // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
const signCallbackUrl = `${window.location.origin}/signcallback`; // The url called by the server when transaction signing flow is finished - must match one of the callback strings listed in the App Registration

const eosTransitWalletProviders = [
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

const loginButtonStyle = { width: 200, marginTop: '24px', cursor: 'pointer' };

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginWithIdToken: '',
      isLoggedIn: false,
      userInfo: {},
      sendEthForGas: false,
      widgetResponse: null,
      chainAccountItem: '',
      chainAccountPermissionItem: ''
    };
  }

  // called by library to set local busy state
  setBusyCallback = (isBusy, isBusyMessage) => this.setState({ isBusy, isBusyMessage });

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

  // intialize webwidget
  webwidget = new OreIdWebWidget(this.oreId, window);

  get loggedInProvider(){
    return this.oreId.accessTokenHelper.decodedAccessToken['https://oreid.aikon.com/provider']
  }


  walletButtons = [
    { provider: ExternalWalletType.AlgoSigner, chainNetwork: ChainNetwork.AlgoTest },
    { provider: ExternalWalletType.Keycat, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Ledger, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Lynx, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Meetone, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Portis, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Scatter, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.SimpleEos, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.TokenPocket, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Web3, chainNetwork: ChainNetwork.EthRopsten },
    { provider: ExternalWalletType.WhaleVault, chainNetwork: ChainNetwork.EosKylin }
  ]

  async componentWillMount() {
    await this.loadUserFromLocalStorage();
    this.handleAuthCallback();
    this.handleSignCallback();
    window.oreId = this.oreId;
    window.webwidget = this.webwidget;
    document.addEventListener('click', e => {
      if (this.state.errorMessage && !e.target.contains(document.querySelector('[data-tag=error-message]'))){
        this.setState({ errorMessage: null })
      }
    })
  }

  /** Load the user from local storage - user info is automatically saved to local storage by oreId.auth.user.getData() */
  async loadUserFromLocalStorage() {
    let { accessToken } = this.oreId;
    if (!accessToken) return;
    await this.loadUserFromApi();
  }

  async loadUserFromApi() {
    try {
      await this.oreId.auth.user.getData();
      const userInfo = this.oreId.auth.user.data;
      this.setState({ userInfo, isLoggedIn: true });
      console.log({userInfo})
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

  handleLogout = () => {
    this.clearErrors();
    this.oreId.logout(); // clears local user state (stored in local storage or cookie)
    // this.setState({ userInfo: {}, isLoggedIn: false });
    // call logout on ORE ID to delete OAuth tokens
    window.location = `${oreIdUrl}/logout?app_id=${this.oreId.options.appId}&providers=all&callback_url=${window.location.origin}`;
  }

  handleSignButton = async ({
    chainAccount,
    chainNetwork,
    permission,
    externalWalletType,
    provider,
  }) => {
    this.clearErrors();
    const { sendEthForGas, userInfo } = this.state;
    await this.handleSignSampleTransaction(
      externalWalletType,
      provider,
      userInfo.accountName,
      chainAccount,
      chainNetwork,
      permission,
      sendEthForGas
    );
  }

  handleWalletDiscoverButton = async ({ provider, chainNetwork } = {}) => {
    try {
      this.clearErrors();
      const { accountName } = this.state.userInfo;

      if (!this.oreId.transitHelper.canDiscover(provider)) {
        console.log(
          'Provider doesn\'t support discover, so discover function will call wallet provider\'s login instead.'
        );
      }
      await this.oreId.transitHelper.discover({
        walletType: provider,
        chainNetwork,
        oreAccount: accountName
      });
      this.loadUserFromApi(); // reload user from ore id api - to show new keys discovered
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  handleSignStringWithWallet = async ({ provider, chainNetwork }) => {
    try {
      this.clearErrors();
      const { signedString } = await this.oreId.signStringWithWallet({
        account: this.state.userInfo?.accountName,
        walletType: provider,
        provider,
        chainNetwork,
        string: 'Sign Arbitrary',
        message: 'Placeholder'
      });
      console.log(`Signed String: ${signedString}`);
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  handleLogin = async (provider, chainNetwork = ChainNetwork.EosKylin) => {
    try {
      this.clearErrors();
      this.webwidget.onAuth({
        params: { provider },
        onSuccess: (userData) => this.setState({ userInfo: userData, isLoggedIn: true, loggedProvider: provider }),
        onError: async () => {
          // redirect the browser to it to start the user's OAuth login flow
          const { loginUrl } = await this.oreId.auth.getLoginUrl({ provider, chainNetwork });
          if (loginUrl) {
            // redirect browser to loginURL
            window.location.href = loginUrl;
          }
        }
      })     
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  /** alternatively login user with a 3rd-party OAuth token - sets accessToken for the user
   *  NOTE: The 3rd-party access token must be an OAuth token issued by a known service and OAuth clientId
   *        E.g. Google app you've registered via Google Authentication
   *        To use for your app, your Google app must be configured with your ORE ID App Registration
   *        To get a token to use for this demo app, use the Google OAuth Playground to get an OAuth Id Token for your own Google account - must select Scope: 'Google OAuth2 API v2' userinfo.profile and userinfo.email authorizations
   *        Use this link, login, then click [Exchange authorization code for tokens] button https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?redirect_uri=https%3A%2F%2Fdevelopers.google.com%2Foauthplayground&prompt=consent&response_type=code&client_id=407408718192.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&access_type=offline&flowName=GeneralOAuthFlow
   */
  async handleLoginWithIdToken(idToken, chainNetwork = ChainNetwork.EosKylin) {
    try {
      this.clearErrors();
      let loginResponse = await this.oreId.login({ idToken, chainNetwork }); // no provider required - will use 'oreid' as provider
      let { accessToken, errors } = loginResponse;
      if (errors) {
        this.setState({ errorMessage: errors });
        return;
      }
      // if the idToken is valid, login responds with an accessToken
      this.oreId.accessToken = accessToken;
      await this.loadUserFromLocalStorage();
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
    externalWalletType,
    provider,
    account,
    chainAccount,
    chainNetwork,
    permission,
    sendEthForGas
  ) {
    try {
      const transactionData = await this.prepareTransactionData({ chainNetwork, chainAccount, permission, provider, externalWalletType, sendEthForGas, account });
      console.log({transactionData})
      this.setResponseSignTransaction('','','','');
      const transaction = await this.oreId.createTransaction(transactionData)
      let signResponse
      if (externalWalletType)
        signResponse = await transaction.signWithWallet(externalWalletType);
      else
        signResponse = await transaction.getSignUrl();
      console.log({ signResponse })
      // if the sign responds with a signUrl, then redirect the browser to it to call the signing flow
      const { signUrl, signedTransaction, transactionId } =
        signResponse || {};
      if (signUrl) {
        // redirect browser to signUrl
        window.location.href = signUrl;
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

  async prepareTransactionData({ chainNetwork, chainAccount, permission, externalWalletType, provider, sendEthForGas, account }) {
    const sampleTransaction = await this.composeSampleTransaction({ chainNetwork, chainAccount, permission, externalWalletType, provider, sendEthForGas });

    const transactionData = {
      account: account || '',
      chainAccount: chainAccount || '',
      chainNetwork: chainNetwork || '',
      transaction: sampleTransaction,
      signOptions: {
        broadcast: true,
        preventAutoSign: false,
        provider: externalWalletType || provider,
        returnSignedTransaction: true,
        state: 'abc',
      },
    };
    return transactionData;
  }

  async composeSampleTransaction({ chainNetwork, chainAccount, permission, externalWalletType, provider, sendEthForGas }) {
    let transaction;
    if (this.getChainType(chainNetwork) === 'algo') {
      transaction = this.createSampleTransactionAlgorand(chainAccount, permission);
      transaction = this.wrapTxActionArrayForOreId(externalWalletType || provider, transaction);
    }
    if (this.getChainType(chainNetwork) === 'eth') {
      if (sendEthForGas) {
        await this.fundEthereumAccountIfNeeded(chainAccount, chainNetwork);
      }
      transaction = this.createSampleTransactionEthereum(chainAccount, permission);
      transaction = this.wrapTxActionArrayForOreId(externalWalletType || provider, transaction);
    }
    if (this.getChainType(chainNetwork) === 'eos') {
      transaction = this.createSampleTransactionEos(
        chainAccount,
        permission
      );
    }
    return transaction;
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

  createSampleTransactionEthereum(actor, permission = 'active') {
    return {
      from: actor,
      to: '0x0d165491039B70c6Ea97d6Ccf6C4A861BfF20899',
      // contract: {
      //   abi: ABI,
      //   parameters: [ethereumContractAccountAddress, ERC20_TRANSFER_AMOUNT],
      //   method: 'transfer'
      // },
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

  toggleSendEthForGas = () => this.setState({ sendEthForGas: !this.state.sendEthForGas });

  /*
  Handle the authCallback coming back from ORE-ID with an "account" parameter indicating that a user has logged in
*/
  async handleAuthCallback() {
    const url = window.location.href;
    let errors, state
    if (/authcallback/i.test(url)) {
      try {
        ;({ errors, state } = this.oreId.auth.handleAuthCallback(url));
        if (state) console.log(`state returned with request:${state}`);
      } catch (error) {
        console.error(error)
      }
      if (!errors) {
        window.location.replace('/')
      }
    }
  }

  /**  Handle the signCallback coming back from ORE-ID with a "signedTransaction" parameter providing the transaction object with signatures attached */
  async handleSignCallback() {
    const url = window.location.href;
    if (/signcallback/i.test(url)) {
      const { signedTransaction, state, transactionId, errors } = this.oreId.handleSignCallback(url);
      this.setResponseSignTransaction(signedTransaction, state, transactionId, errors);
    }
  }

  /** update display of sign transction response */
  setResponseSignTransaction(signedTransaction, state, transactionId, errors) {
    if (!errors) {
      this.setState({ errorMessage: '' });
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

  setResponseErrors(errors) {
    if (typeof errors === 'string') {
      this.setState({ errorMessage: errors.replace(', ') });
    } else {
      this.setState({ errorMessage: errors.join(', ') });
    }
  }

  setWidgetSuccess({ data }) {
    this.setState({ widgetResponse: JSON.stringify(data) });
  }

  /** compose object of properties that can be added to WebWidget React component */
  composePropsForWebWidget(action, actionParams) {
    const webwidgetProps = {
      onSuccess: (result) => {
        console.log('widget results:', result);
        this.setWidgetSuccess(result);
      },
      onError: (result) => {
        this.setResponseErrors(result.errors);
      }
    };

    // handle onSuccess differently depending on action type
    switch (action) {
      case 'sign':
        webwidgetProps.onSuccess = ({ data }) => {
          this.setResponseSignTransaction(data.signed_transaction, data.state, data.transaction_id, data.errors);
        }
        webwidgetProps.transaction = actionParams.transaction
        break
      case 'newChainAccount':
        webwidgetProps.options = {
          accountType: actionParams.accountType,
          chainNetwork: actionParams.chainNetwork
        }
        break
      default:
        break
    }
    return webwidgetProps;
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
      widgetResponse
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
        {errorMessage && (
          <div data-tag="error-message" style={{ color: 'red', right: '50px', top: '50px', marginLeft: '20px', wordBreak: 'break-all', backgroundColor: 'yellow', padding: '10px', position: 'fixed' }}>
            {errorMessage}
          </div>
        )}
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
          data-testid="signed-transaction-result"
          style={{ color: 'blue', marginLeft: '50px', marginTop: '10px' }}
        >
          <p className="log">
            {signedTransaction &&
              `Returned signed transaction: ${signedTransaction}`}
          </p>
        </div>
        <div
          style={{ color: 'green', marginLeft: '50px', marginTop: '10px' }}
        >
          <p data-testid="web-widget-response" className="log">
            {widgetResponse &&
              `Web Widget Response: ${widgetResponse}`}
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
        {isLoggedIn && this.renderSignWithWallet()}
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
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  renderSigningOptions() {
    const { chainAccounts } = this.state.userInfo;
    return (
      <div style={{ marginTop: 50, marginLeft: 20 }}>
        <hr />
        <h3>Sign sample transaction with one of your keys</h3>
        <select value={this.state.chainAccountItem} onChange={e => this.setState({ chainAccountItem: e.target.value, chainAccountPermissionItem: '0' })}>
          <option value="" />
          {chainAccounts.map((chainAccount, index) => (
            <option key={index} value={index}>{`${chainAccount.chainAccount} (${chainAccount.chainNetwork})`}</option>
          ))}
        </select>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {this.renderSignButtons()}
        </div>
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
        <label htmlFor="eth" style={{ paddingLeft: 10 }}>
          For Ethereum - Check the box above if you want to automatically send Eth for gas required for sample transaction if needed
        </label>
      </div>
    );
  }

  renderDiscoverOptions = () => (
    <div style={{ marginTop: 50, marginLeft: 20 }}>
      <hr />
      <h3>Or discover a key in your wallet</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {this.renderWalletButtons(this.handleWalletDiscoverButton)}
      </div>
    </div>
  );

  renderSignWithWallet = () => (
    <div style={{ marginTop: 50, marginLeft: 20 }}>
      <hr />
      <h3>Or sign string with your wallet</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {this.renderWalletButtons(this.handleSignStringWithWallet)}
      </div>
    </div>
  );

  async handleSignWithWidget({ chainAccount, chainNetwork, permission }) {
    this.clearErrors();
    const { sendEthForGas, userInfo, loggedProvider } = this.state;
    let { accountName } = userInfo;
    const provider = loggedProvider || 'google';
    const transactionData = await this.prepareTransactionData({
      chainNetwork,
      chainAccount,
      permission,
      provider,
      sendEthForGas,
      account: accountName
    });
    const transaction = await this.oreId.createTransaction(transactionData);
    const webWidgetProps = this.composePropsForWebWidget('sign', { transaction });
    this.webwidget.onSign(webWidgetProps);
  }

  async handleCreateNewAccountWithWidget({ chainNetwork, permission }) {
    this.clearErrors();
    const newAccountActionParams = {
      accessToken: this.oreId.accessToken,
      chainNetwork,
      accountType: 'native',
      provider: 'google'
    };
    const webWidgetProps = this.composePropsForWebWidget('newChainAccount', newAccountActionParams);
    this.webwidget.onNewChainAccount(webWidgetProps);
  }

  // render one sign transaction button for each chain
  renderSignButtons = () => {
    const { chainAccountItem, chainAccountPermissionItem} = this.state
    if (chainAccountItem === '') return null
    const userChainAccount = this.state.userInfo.chainAccounts[chainAccountItem]
    const chainAccountPermission = userChainAccount.permissions[chainAccountPermissionItem]
    const provider = chainAccountPermission.externalWalletType || 'oreid';
    return (
      <div style={{
        width: '700px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        margin: '5px',
        padding: '5px',
        border: '1px solid lightgray',
        borderRadius: '10px'
      }}>
        <div>
          <strong>Chain: </strong> {userChainAccount.chainNetwork}
        </div>
        <div style={{
          width: '100%',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}>
          <strong>Account: </strong>{userChainAccount.chainAccount}
        </div>
        <div>
          <strong>Permission: </strong>
          <select value={chainAccountPermissionItem} onChange={e => this.setState({ chainAccountPermissionItem: e.target.value })}>
            {userChainAccount.permissions.map((permission, index) => (
              <option key={index} value={index}>{`${permission.name} (${permission.accountType})`}</option>
            ))}
          </select>
        </div>
        <LoginButton
          key={chainAccountPermission?.externalWalletType}
          provider={provider}
          data-tag={`sign-${provider}`}
          buttonStyle={{
            cursor: 'pointer',
            margin: '2px',
            width: '50%'
          }}
          text={`Sign via ${chainAccountPermission?.externalWalletType || 'Callback'}`}
          onClick={() => this.handleSignButton({
            chainAccount: userChainAccount.chainAccount, 
            chainNetwork: userChainAccount.chainNetwork, 
            permission: chainAccountPermission,
            externalWalletType: chainAccountPermission?.externalWalletType,
            provider: !chainAccountPermission?.externalWalletType && this.loggedInProvider,
          })}
        />
        {!chainAccountPermission.externalWalletType && (          
          /* Show button to sign with OREID WebWidget  (don't show if the key is in a local wallet app)*/
          <>
            <LoginButton
              key={chainAccountPermission.externalWalletType}
              provider={provider}
              text="Sign with Web Widget"
              buttonStyle={{
                cursor: 'pointer',
                margin: '2px',
                width: '50%'
              }}
              onClick={() => this.handleSignWithWidget(userChainAccount)}
            />
            <LoginButton
              key={provider}
              provider={provider}
              text="Create account with Web Widget"
              buttonStyle={{
                cursor: 'pointer',
                margin: '2px',
                width: '50%'
              }}
              onClick={() => this.handleCreateNewAccountWithWidget(userChainAccount)}
            />
          </>
        )}
      </div>
    );
  };

  // render wallet button for each chain
  renderWalletButtons = (handleClick) => this.walletButtons.map((wallet, index) => (
    <div style={{ margin: '5px' }} key={index}>
      <LoginButton
        provider={wallet.provider}
        data-tag={`discover-${wallet.provider}-${index}`}
        buttonStyle={{
          width: '100%',
          minHeight: '75px',
          cursor: 'pointer'
        }}
        onClick={() => handleClick(wallet)}
        text={wallet.provider}
      />
    </div>
  ));

  renderLoginButtons = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
      <LoginButton
        provider="apple"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('apple')}
      />
      <LoginButton
        provider="facebook"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('facebook')}
      />
      <LoginButton
        provider="twitter"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('twitter')}
      />
      <LoginButton
        provider="github"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('github')}
      />
      <LoginButton
        provider="twitch"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('twitch')}
      />
      <LoginButton
        provider="line"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('line')}
      />
      <LoginButton
        provider="kakao"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('kakao')}
      />
      <LoginButton
        provider="linkedin"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('linkedin')}
      />
      <LoginButton
        provider="google"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('google')}
      />
      <LoginButton
        provider="email"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('email')}
      />
      <LoginButton
        provider="phone"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('phone')}
      />
      <LoginButton
        provider="scatter"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('scatter')}
      />
      <LoginButton
        provider="ledger"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('ledger')}
      />
      <LoginButton
        provider="meetone"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('meetone')}
      />
      <LoginButton
        provider="lynx"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('lynx')}
      />
      <LoginButton
        provider="portis"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('portis')}
      />
      <LoginButton
        provider="whalevault"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('whalevault')}
      />
      <LoginButton
        provider="simpleos"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('simpleos')}
      />
      <LoginButton
        provider="keycat"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLogin('keycat')}
      />
      <span style={{ flexBasis: '100%' }}> 
        <label>
          Id Token:
          <input type="text" value={this.state.loginWithIdToken} onChange={(e) => this.setState({ loginWithIdToken: e.target.value })} />
        </label>
        <LoginButton
          provider="oreid"
          buttonStyle={loginButtonStyle}
          text="Login with id token"
          onClick={() => this.handleLoginWithIdToken(this.state.loginWithIdToken)}
        />
      </span>
    </div>
  );
}

export default App;
