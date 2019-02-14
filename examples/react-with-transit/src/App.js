import dotenv from 'dotenv';
import React, { Component } from 'react';
import LoginButton from './components/loginButton';
import { OreId } from '@apimarket/oreid-js';
import { initAccessContext } from 'eos-transit';
import scatter from 'eos-transit-scatter-provider';
import oreid from 'eos-transit-oreid-provider';
dotenv.config();

const {
  REACT_APP_OREID_APP_ID:appId,              // Provided when you register your app
  REACT_APP_OREID_API_KEY:apiKey,             // Provided when you register your app
  REACT_APP_AUTH_CALLBACK:authCallback,    // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_OREID_URL:oreIdUrl,               // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR:backgroundColor  // Background color shown during login flow
} = process.env;

let oreId = new OreId({ appId, apiKey, oreIdUrl });

const PROVIDERS = [
  'facebook',
  'twitter',
  'github',
  'twitch',
  'linkedin',
  'google'
];

const NETWORK_EOS = {
  host: 'api.eosnewyork.io',
  port: 443,
  protocol: 'https',
  chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
};

const NETWORK_ORE = {
  //host: 'ore.openrights.exchange',
  host: 'ore-staging.openrights.exchange',
  port: 443,
  protocol: 'https',
  chainId: 'a6df478d5593b4efb1ea20d13ba8a3efc1364ee0bf7dbd85d8d756831c0e3256' // staging
};

const WALLET_CONFIG = {
  appId,
  apiKey,
  oreIdUrl,
  authCallback,
  //loginType: 'facebook',
  signCallback: authCallback, // TODO: Make unique
  backgroundColor
};

function getProvider(loginType) {
  return oreid({
    ...WALLET_CONFIG,
    loginType,
  });
}

function getContextOre(loginType) {
  return initAccessContext({
    appName: 'OreID',
    network: NETWORK_ORE,
    walletProviders: [
      getProvider(loginType)
    ],
  });
}

function getWallet(loginType = 'facebook') {
  const context = getContextOre(loginType);
  const providers = context.getWalletProviders();
  return context.initWallet(providers[0]);
}

function getTransaction(actor, permission = 'active') {
  const transaction = {
    account: "eosio.token",
    name: "transfer",
    authorization: [{
      actor,
      permission,
    }],
    data: {
      from: actor,
      to: actor,
      quantity: "1.0000 CPU",
      memo: `random number: ${Math.random()}`
    }
  };

  return Buffer.from(JSON.stringify(transaction)).toString('base64');
}

const accessContextEos = initAccessContext({
  appName: 'OreID',
  network: NETWORK_EOS,
  walletProviders: [
    scatter()
  ]
});

const providersEos = accessContextEos.getWalletProviders();
const wallet_scatter = accessContextEos.initWallet(providersEos[0]);

const wallet_oreid = getWallet();

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      userInfo: undefined,
      accountInfo: undefined,
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleTransaction = this.handleTransaction.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  async componentWillMount() {
    console.log("State:", this.state);
    console.log("Wallet: Scatter:", wallet_scatter);
    console.log("Wallet: OreID:", wallet_oreid);

    console.log("Connecting to wallets...");
    try { wallet_scatter.connect(); } catch(error) { console.log("Failed to connect to Scatter:", error) }
    try { await wallet_oreid.connect(); } catch(error) { console.log("Failed to connect to OreID:", error) }

    console.log("Connected wallets: Scatter:", wallet_scatter.connected, "OreID:", wallet_oreid.connected);

    const url = window.location.href;
    if (/authcallback/i.test(url)) {
      const {account, errors} = await oreId.handleAuthResponse(url);
      if(!errors && wallet_oreid.connected) {
        const {account_name, permissions} = await wallet_oreid.login(account);
        const userInfo = await oreId.getUserInfoFromApi(account);
        this.setState({userInfo, accountInfo: {account_name, permissions}, isLoggedIn:true});
      }
    }
  }

  async handleLogin(loginType) {
    console.log(`Logging into ${loginType}...`);
    try {
      if (loginType === 'scatter') {
        if (wallet_scatter.connected) {
          const {account_name, permissions} = await wallet_scatter.login();
          console.log("Setting accountinfo:", account_name);
          if (wallet_scatter.authenticated) {
            console.log("Logged in!", wallet_scatter);
            this.setState({ accountInfo: {account_name, permissions}, isLoggedIn: true });
          }
        } else {
          throw(new Error("Scatter not connected!"));
        }
      } else { // facebook, github, etc...
        const wallet = getWallet(loginType);
        wallet.login();
      }
    } catch(error) {
      console.log("Failed to login:", error);
    }
  }

  handleTransaction() {
    const {account_name} = this.state.accountInfo;
    const transaction = getTransaction(account_name);
    console.log("handleTx:", account_name, transaction, wallet_oreid);
    wallet_oreid.eosApi.transact({
        actions: [transaction]
      }, {
        broadcast: true,
        blocksBehind: 3,
        expireSeconds: 60
      }
    )
  }

  handleLogout() {
    this.setState({userInfo:{}, isLoggedIn:false});
    oreId.logout(); //clears local user state (stored in local storage or cookie)
  }

  render() {
    return (
      <div>
        {!this.state.isLoggedIn &&
          this.renderLoginButtons()
        }
        {this.state.isLoggedIn &&
          this.renderUserInfo()
        }
      </div>
    );
  }

  renderUserInfo() {
    if (this.state.userInfo) {
      const {accountName, email, name, picture, username} = this.state.userInfo;
      const {account_name, permissions} = this.state.accountInfo;
      const permission_info = permissions.map(perm => { return perm.perm_name }).join(", ")
      return (
        <div>
          <img src={picture} style={{width:50,height:50}} alt="avatar" /><br/>
          accountName: {account_name}<br/>
          name: {name}<br/>
          username: {username}<br/>
          email: {email}<br/>
          permissions: {permission_info}<br/>
          <button onClick={this.handleTransaction}  style={{ padding: '10px', backgroundColor: '#FFFBE6', borderRadius: '5px'}}>
            Sign Transaction
          </button>
          <button onClick={this.handleLogout}  style={{ padding: '10px', backgroundColor: '#FFFBE6', borderRadius: '5px'}}>
            Logout
          </button>
        </div>
      );
    }
  }

  renderLoginButtons() {
    const loginButtons = PROVIDERS.map((provider) => {
      return <LoginButton provider={provider}
              buttonStyle={{width:250, marginTop:'24px'}}
              logoStyle={{marginLeft:0}}
              onClick={()=>this.handleLogin(provider)} />
    });

    return (
      <div>
        <LoginButton provider='scatter'
                    buttonStyle={{width:250}}
                    logoStyle={{marginLeft:0}}
                    onClick={()=>this.handleLogin("scatter")}
                    //  text='Log in with Facebook'
        />
        {loginButtons}
      </div>
    )
  }
}

export default App;
