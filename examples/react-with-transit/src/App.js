import dotenv from 'dotenv';
import React, { Component } from 'react';
import LoginButton from './components/loginButton';
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

const accessContext = initAccessContext({
  appName: 'OreID',
  network: {
    host: 'api.eosnewyork.io',
    port: 443,
    protocol: 'https',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
  },
  walletProviders: [
    oreid({
      appId,
      apiKey,
      oreIdUrl,
      authCallback,
      loginType: 'facebook',
      signCallback: authCallback, // TODO: Make unique
      backgroundColor
    }),
    scatter()
  ]
});

const providers = accessContext.getWalletProviders();
const wallet_oreid = accessContext.initWallet(providers[0]);
const wallet_scatter = accessContext.initWallet(providers[1]);

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      userInfo: undefined,
      accountInfo: undefined,
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

async componentWillMount() {
  console.log("State:", this.state);
  console.log("Wallet: Oreid:", wallet_oreid);
  console.log("Wallet: Scatter:", wallet_scatter);

  console.log("Connecting to wallets...");
  try { await wallet_oreid.connect(); } catch(error) { console.log("Failed to connect to OreId:", error) }
  try { await wallet_scatter.connect(); } catch(error) { console.log("Failed to connect to Scatter:", error) }
  console.log("Connected wallets: OreId:", wallet_oreid.connected, "Scatter:", wallet_scatter.connected);
}

async handleLogin(loginType) {
  console.log(`Logging into ${loginType}...`);
  try {
    if (loginType === 'scatter') {
      if (wallet_scatter.connected) {
        const accountInfo = await wallet_scatter.login();
        this.setState({ accountInfo });
        console.log("Logged in!", wallet_scatter.authenticated);
      } else {
        throw(new Error("Scatter not connected!"));
      }
    } else {
      if (wallet_oreid.connected) {
        await wallet_oreid.login();
      } else {
        throw(new Error("OreId not connected!"));
      }
    }
  } catch(error) {
    console.log("Failed to login:", error);
  }
}

handleLogout() {
  console.log("Logging out...");
  wallet_oreid.logout();
  wallet_scatter.logout();
  console.log("Logged out!");
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
    return (
      <div>
        <img src={picture} style={{width:50,height:50}} alt="avatar" /><br/>
        accountName: {accountName}<br/>
        name: {name}<br/>
        username: {username}<br/>
        email: {email}<br/>
        <button onClick={this.handleLogout}  style={{ padding: '10px', backgroundColor: '#FFFBE6', borderRadius: '5px'}}>
          Logout
        </button>
      </div>
    );
  } else if (this.state.accountInfo) {
    const {accountName} = this.state.accountInfo;
    return (
      <div>
        accountName: {accountName}<br/>
        <button onClick={this.handleLogout}  style={{ padding: '10px', backgroundColor: '#FFFBE6', borderRadius: '5px'}}>
          Logout
        </button>
      </div>
    );
  }
}

renderLoginButtons() {
  return (
    <div>
      <LoginButton provider='scatter'
                  buttonStyle={{width:250}}
                  logoStyle={{marginLeft:0}}
                  onClick={()=>this.handleLogin("scatter")}
                  //  text='Log in with Facebook'
      />
      <LoginButton provider='facebook'
                  buttonStyle={{width:250, marginTop: '24px'}}
                  logoStyle={{marginLeft:0}}
                  onClick={()=>this.handleLogin("facebook")}
                  //  text='Log in with Facebook'
      />
      <LoginButton provider='twitter'
                  buttonStyle={{width:250, marginTop:'24px'}}
                  logoStyle={{marginLeft:0}}
                  onClick={()=>this.handleLogin("twitter")}
                  //  text='Log in with Twitter'
      />
      <LoginButton provider='github'
                  buttonStyle={{width:250, marginTop:'24px'}}
                  logoStyle={{marginLeft:0}}
                  onClick={()=>this.handleLogin("github")}
                  //  text='Log in with Github'
      />
      <LoginButton provider='twitch'
                  buttonStyle={{width:250, marginTop:'24px'}}
                  logoStyle={{marginLeft:0}}
                  onClick={()=>this.handleLogin("twitch")}
                  //  text='Log in with Twitch'
      />
      <LoginButton provider='linkedin'
                  buttonStyle={{width:250, marginTop:'24px'}}
                  logoStyle={{marginLeft:0}}
                  onClick={()=>this.handleLogin("linkedin")}
                  //  text='Log in with LinkedIn'
      />
      <LoginButton provider='google'
                  buttonStyle={{width:250, marginTop:'24px'}}
                  logoStyle={{marginLeft:0}}
                  onClick={()=>this.handleLogin("google")}
                  //  text='Log in with Google'
      />
    </div>
  )
}

}

export default App;
