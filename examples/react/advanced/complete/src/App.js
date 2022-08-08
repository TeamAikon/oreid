import dotenv from 'dotenv';
import React, { Component } from 'react';
import LoginButton from 'oreid-login-button';
import { OreId, ExternalWalletType, ChainNetwork } from 'oreid-js';
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
// TRANSIT
import algoSignerProvider from 'eos-transit-algosigner-provider';
import scatterProvider from 'eos-transit-scatter-provider';
import { WebPopup } from "oreid-webpopup";
// import ledgerProvider from 'eos-transit-ledger-provider';
import lynxProvider from 'eos-transit-lynx-provider';
import meetoneProvider from 'eos-transit-meetone-provider';
import tokenpocketProvider from 'eos-transit-tokenpocket-provider';
import whalevaultProvider from 'eos-transit-whalevault-provider';
import simpleosProvider from 'eos-transit-simpleos-provider';
import web3Provider from 'eos-transit-web3-provider';
import walletconnectProvider from 'eos-transit-walletconnect-provider';
// UAL
import { Anchor } from 'ual-anchor'
import { Ledger } from 'ual-ledger'
import { Scatter } from 'ual-scatter'
import { TokenPocket } from 'ual-token-pocket'
import { Wombat } from 'ual-wombat'
// import { Lynx } from 'ual-lynx'
// import { MeetOne } from 'ual-meetone'
import {
  ERC20_FUNDING_AMOUNT,
  ERC20_TRANSFER_AMOUNT,
  ETH_TRANSFER_AMOUNT
} from './constants';
import { composeAlgorandSampleTransaction } from './algorand';
import SignEosTxWithWallet from './components/SignEosTxWithWallet'

dotenv.config();

const {
  REACT_APP_OREID_APP_ID: appId = 'demo_0097ed83e0a54e679ca46d082ee0e33a', // Provided when you register your app
  REACT_APP_OREID_API_KEY: apiKey, // Optional - required for some advanced features including autoSign and custodial accounts
  REACT_APP_OREID_URL: oreIdUrl = 'https://service.oreid.io', // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR: backgroundColor, // Background color shown during login flow
  REACT_APP_ETHEREUM_CONTRACT_ADDRESS: ethereumContractAddress,
  REACT_APP_ETHEREUM_CONTRACT_ACCOUNT_ADDRESS: ethereumContractAccountAddress,
  REACT_APP_ETHEREUM_CONTRACT_ACCOUNT_PRIVATE_KEY: ethereumContractAccountPrivateKey,
  REACT_APP_ETHEREUM_FUNDING_ACCOUNT_ADDRESS: ethereumFundingAddress,
  REACT_APP_ETHEREUM_FUNDING_ACCOUNT_PRIVATE_KEY: ethereumFundingAddressPrivateKey,
  REACT_APP_ALGORAND_EXAMPLE_TO_ADDRESS: transferAlgoToAddress // address of account to send Algos to (for sample transaction)
} = process.env;

const eosTransitWalletProviders = [
  // scatterProvider(),
  lynxProvider(),
  meetoneProvider(),
  tokenpocketProvider(),
  whalevaultProvider(),
  simpleosProvider(),
  algoSignerProvider(),
  web3Provider(),
  walletconnectProvider()
];

let ualAuthenticators = [
  Anchor,
  Ledger,
  Scatter,
  TokenPocket,
  Wombat,
  // Lynx,
  // MeetOne,
]

const loginButtonStyle = { width: 200, marginTop: '24px', cursor: 'pointer' };

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginWithIdToken: '',
      isLoggedIn: false,
      userInfo: {},
      sendEthForGas: false,
      popupResponse: null,
      selectedChainAccountIndex: '',
      selectedChainAccountPermissionStringified: '',
    };
  }

  async componentDidMount() {
    // intialize oreId
    this.oreId = new OreId({
      appName: 'ORE ID Sample App',
      appId,
      apiKey,
      oreIdUrl,
      plugins: {
        popup: WebPopup(),
      },
      backgroundColor,
      ualAuthenticators,
      eosTransitWalletProviders,
      setBusyCallback: this.setBusyCallback
    });
    await this.oreId.init();
    await this.loadUserFromLocalStorage();
    console.log(this.userInfo)
  }

  // called by library to set local busy state
  setBusyCallback = (isBusy, isBusyMessage) => this.setState({ isBusy, isBusyMessage });

  walletButtons = [
    { provider: ExternalWalletType.AlgoSigner, chainNetwork: ChainNetwork.AlgoTest },
    { provider: ExternalWalletType.Anchor, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Ledger, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Lynx, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Meetone, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Portis, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Scatter, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.SimpleEos, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.TokenPocket, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.Web3, chainNetwork: ChainNetwork.EthRopsten },
    { provider: ExternalWalletType.Wombat, chainNetwork: ChainNetwork.EosKylin },
    { provider: ExternalWalletType.WhaleVault, chainNetwork: ChainNetwork.EosKylin }
  ]

  async componentWillMount() {
  }

  /** Load the user from local storage - user info is automatically saved to local storage by oreId.auth.user.getData() */
  async loadUserFromLocalStorage() {
    const { accessToken } = this.oreId;
    if (!accessToken) return;
    await this.loadUserFromApi();
  }

  async loadUserFromApi() {
    try {
      await this.oreId.auth.user.getData();
      const userInfo = this.oreId.auth.user.data;
      this.setState({ userInfo, isLoggedIn: true });
      console.log({ userInfo });
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
    this.setState({ isLoggedIn: false })
  }

  handleSignWithWallet = async ({
    chainAccount,
    chainNetwork,
    permission,
    externalWalletType,
    provider
  }) => {
    this.clearErrors();
    const { sendEthForGas, userInfo } = this.state;
    await this.handleSignSampleTransactionWithWallet({
      externalWalletType,
      provider,
      account: userInfo.accountName,
      chainAccount,
      chainNetwork,
      permission,
      sendEthForGas
      });
  }

  handleWalletDiscoverButton = async ({ provider, chainNetwork } = {}) => {
    try {
      this.clearErrors();
      const { accountName } = this.state.userInfo;

      if (!this.oreId.walletHelper.canDiscover(provider)) {
        console.log(
          'Provider doesn\'t support discover, so discover function will call wallet provider\'s login instead.'
        );
        this.setState({ errorMessage: 'Provider doesn\'t support discover' });
        return
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
      const opts = {
        account: this.state.userInfo?.accountName,
        walletType: provider,
        provider,
        chainNetwork,
        string: 'Sign Arbitrary',
        message: 'Placeholder'
      }
      const { signedString } = await this.oreId.signStringWithWallet(opts);
      this.setState({ popupResponse: signedString });
      console.log(`Signed String: ${signedString}`);
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  handleLoginWithPopup = async (provider) => {
    try {
      this.clearErrors();
      await this.oreId.popup.auth({ provider });
      const userData = this.oreId.auth.user.getData();
      this.setState({ userInfo: userData, isLoggedIn: true, loggedProvider: provider })
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
  async handleLoginWithToken(oauthToken) {
    try {
      this.clearErrors();
      await this.oreId.auth.loginWithToken({ oauthToken }); // sets auth.accessToken using response
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  /** Trigger connection to a wallet app */
  async handleLoginWithWalletApp(walletType, chainNetwork) {
    try {
      this.clearErrors();
      const response = await this.oreId.auth.connectWithWallet({ walletType, chainNetwork }); // sets auth.accessToken using response
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

  async handleSignSampleTransactionWithWallet({
    externalWalletType,
    provider,
    account,
    chainAccount,
    chainNetwork,
    permission,
    sendEthForGas
  }) {
    try {
      this.setResponseSignTransaction('','','','');
      const transactionData = await this.prepareTransactionData({ chainNetwork, chainAccount, permission, provider, externalWalletType, sendEthForGas, account });
      const transaction = await this.oreId.createTransaction(transactionData);
      let signResponse;
      if (externalWalletType) signResponse = await transaction.signWithWallet(externalWalletType);
      else signResponse = await transaction.getSignUrl();
      console.log({ signResponse });
      // if the sign responds with a signUrl, then redirect the browser to it to call the signing flow
      const { signUrl, signedTransaction, transactionId } = signResponse || {};
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
        state: 'abc'
      }
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

  /** update display of sign transction response */
  setResponseSignTransaction(signedTransaction, state, transactionId) {
    if (state) this.setState({ signState: state });
    if (signedTransaction) {
      this.setState({
        signedTransaction: JSON.stringify(signedTransaction)
      });
    }
    if (transactionId) {
      this.setState({ transactionId: JSON.stringify(transactionId) });
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
      popupResponse
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
          <div data-tag="error-message" style={{ color: 'red', right: '50px', top: '50px', marginLeft: '20px', wordBreak: 'break-all', backgroundColor: '#d3d3d3', padding: '10px', position: 'fixed' }}>
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
            {popupResponse &&
              `Response: ${popupResponse}`}
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
        {isLoggedIn && this.renderSignStringWithWallet()}
        {isLoggedIn && this.renderSignEosTxWithWallet()}
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
        Select transaction:
        <select value={this.state.selectedChainAccountIndex} onChange={(e) => {
          this.setState({ selectedChainAccountIndex: e.target.value, selectedChainAccountPermissionStringified: null })
          this.selectDefaultPermissionForSelectedChainAccount(e.target.value)
        }}>
          <option value="" />
          {chainAccounts?.map((chainAccount, index) => (
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

  renderSignStringWithWallet = () => (
    <div style={{ marginTop: 50, marginLeft: 20 }}>
      <hr />
      <h3>Or sign string with your wallet</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {this.renderWalletButtons(this.handleSignStringWithWallet)}
      </div>
    </div>
  );

  renderSignEosTxWithWallet = () => {
    return <SignEosTxWithWallet oreId={this.oreId} userInfo={this.state.userInfo} />
  }

  async handleSignWithPopup({ chainAccount, chainNetwork, permission }) {
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
    try {
      const response = await this.oreId.popup.sign({ transaction})
      this.setResponseSignTransaction(response.signedTransaction, response.state, response.transactionId);
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  async handleCreateNewAccountWithPopup({ chainNetwork, permission }) {
    this.clearErrors();
    try {
      const response = await this.oreId.popup.newChainAccount({
        chainNetwork,
        accountType: 'native',
      })
      this.setState({ popupResponse: JSON.stringify(response) });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  selectDefaultPermissionForSelectedChainAccount(selectedChainAccountIndex) {
    const userChainAccount = this.state.userInfo.chainAccounts[selectedChainAccountIndex];
    if(userChainAccount) {
      // select first permission for default
      this.setState({ selectedChainAccountPermissionStringified: JSON.stringify( userChainAccount?.permissions[0]) });
    }
  }

  // render one sign transaction button for each chain
  renderSignButtons = () => {
    const { selectedChainAccountIndex, selectedChainAccountPermissionStringified } = this.state;
    if (selectedChainAccountIndex === '') return null;
    const userChainAccount = this.state.userInfo.chainAccounts[selectedChainAccountIndex];
    const chainAccountPermission = selectedChainAccountPermissionStringified ? JSON.parse(selectedChainAccountPermissionStringified) : {};
    const provider = chainAccountPermission?.externalWalletType || 'oreid';
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
          <select value={selectedChainAccountPermissionStringified} onChange={(e) => { 
            this.setState({ selectedChainAccountPermissionStringified: e.target.value });
            }}>
            {userChainAccount.permissions.map((permission, index) => (
              <option key={index} value={JSON.stringify(permission)}>{`${permission.name} (${permission.accountType})`}</option>
            ))}
          </select>
        </div>
        {chainAccountPermission?.privateKeyStoredExterally && (
          <LoginButton
            key={provider}
            provider={provider}
            data-tag={`sign-${provider}`}
            buttonStyle={{
              cursor: 'pointer',
              margin: '2px',
              width: '50%'
            }}
            text={`Sign via ${chainAccountPermission?.externalWalletType}`}
            onClick={() => this.handleSignWithWallet({
              chainAccount: userChainAccount.chainAccount,
              chainNetwork: userChainAccount.chainNetwork,
              permission: chainAccountPermission?.name,
              externalWalletType: chainAccountPermission?.externalWalletType,
              provider: chainAccountPermission?.externalWalletType
            })}
          />
        )}
        {!chainAccountPermission?.privateKeyStoredExterally && (
          /* Show button to sign with OREID WebPopup  (don't show if the key is in a local wallet app) */
          <>
            <LoginButton
              key={provider}
              provider={provider}
              text="Sign Transaction"
              buttonStyle={{
                cursor: 'pointer',
                margin: '2px',
                width: '50%'
              }}
              onClick={() => this.handleSignWithPopup({chainAccount: userChainAccount?.chainAccount, chainNetwork: userChainAccount.chainNetwork, permission: chainAccountPermission?.name})}
            />
          </>
        )}
        <LoginButton
          key={'newchainaccount'}
          provider={provider}
          text="Create New Chain Account"
          buttonStyle={{
            cursor: 'pointer',
            margin: '2px',
            width: '50%'
          }}
          onClick={() => this.handleCreateNewAccountWithPopup(userChainAccount)}
        />
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
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
      <LoginButton
        provider="apple"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithPopup('apple')}
      />
      <LoginButton
        provider="facebook"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithPopup('facebook')}
      />
      <LoginButton
        provider="twitter"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithPopup('twitter')}
      />
      <LoginButton
        provider="github"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithPopup('github')}
      />
      <LoginButton
        provider="twitch"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithPopup('twitch')}
      />
      <LoginButton
        provider="line"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithPopup('line')}
      />
      <LoginButton
        provider="kakao"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithPopup('kakao')}
      />
      <LoginButton
        provider="linkedin"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithPopup('linkedin')}
      />
      <LoginButton
        provider="google"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithPopup('google')}
      />
      <LoginButton
        provider="email"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithPopup('email')}
      />
      <LoginButton
        provider="phone"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithPopup('phone')}
      />
      <LoginButton
        provider="anchor"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithWalletApp('anchor', 'eos_main')}
      />
      <LoginButton
        provider="scatter"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithWalletApp('scatter', 'eos_main')}
      />
      <LoginButton
        provider="ledger"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithWalletApp('ledger')}
      />
      <LoginButton
        provider="meetone"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithWalletApp('meetone')}
      />
      <LoginButton
        provider="lynx"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithWalletApp('lynx')}
      />
      <LoginButton
        provider="portis"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithWalletApp('portis')}
      />
      <LoginButton
        provider="web3"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithWalletApp('web3', 'eth_ropsten')}
      />
      <LoginButton
        provider="walletconnect"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithWalletApp('walletconnect', 'eth_ropsten')}
      />
      <LoginButton
        provider="wombat"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithWalletApp('wombat', 'eos_main')}
      />
      <LoginButton
        provider="algosigner"
        buttonStyle={loginButtonStyle}
        onClick={() => this.handleLoginWithWalletApp('algosigner', 'algo_test')}
      />
      <div style={{ flexBasis: '100%', display: 'flex', justifyContent: 'center' }}>
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <label>
            Id Token:
            <input type="text" value={this.state.loginWithIdToken} onChange={(e) => this.setState({ loginWithIdToken: e.target.value })} />
          </label>
          <LoginButton
            provider="oreid"
            buttonStyle={loginButtonStyle}
            text="Login with token"
            onClick={() => this.handleLoginWithToken(this.state.loginWithIdToken)}
          />
        </span>
      </div>
    </div>
  );
}

export default App;
