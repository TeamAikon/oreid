import dotenv from 'dotenv';
import React, { Component } from 'react';
import LoginButton from './components/loginButton';
import { OreId } from '@apimarket/oreid-js';
dotenv.config();

const { 
  REACT_APP_OREID_APP_ID: appId,              // Provided when you register your app
  REACT_APP_OREID_API_KEY:apiKey,             // Provided when you register your app
  REACT_APP_AUTH_CALLBACK:authCallbackUrl,    // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_SIGN_CALLBACK:signCallbackUrl,    // The url called by the server when transaction signing flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_OREID_URL:oreIdUrl,               // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR:backgroundColor  // Background color shown during login flow
} = process.env;

//intialize oreId
let oreId = new OreId({ appName:"ORE ID Sample App", appId, apiKey, oreIdUrl, authCallbackUrl, signCallbackUrl, backgroundColor });

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleSelectPermission = this.handleSelectPermission.bind(this);
  }

async componentWillMount() {
  this.loadUserFromLocalState();
  this.handleAuthCallback();
  this.handleSignCallback();
}

async loadUserFromLocalState() {
  const userInfo = await oreId.getUser();
  console.log(userInfo);
  if((userInfo ||{}).accountName) {
    this.setState({userInfo, isLoggedIn:true});
  }
}

clearErrors() {
  this.setState({errorMessage:null});
}

async handleLogin(loginType) {
  try {
    this.clearErrors();
    let loginResponse = await oreId.login({ loginType });
    console.log(`loginResponse:`, loginResponse);
    //if the login responds with a loginUrl, then redirect the browser to it to start the user's OAuth login flow
    let { isLoggedIn, account, loginUrl, wallet} = loginResponse;
    if(loginUrl) {
      //redirect browser to loginURL
      window.location = loginUrl;
    }
    this.setState({userInfo: {accountName:account}, isLoggedIn:isLoggedIn});
    console.log(`Logged into transit wallet:`, wallet)
  } catch (error) {
    this.setState({errorMessage:error.message});
  }
}

async handleSignSampleTransaction(walletType, account, chainAccount, chainNetwork, permission) {
  try {
    this.clearErrors();
    const transaction = this.getSampleTransaction(account, permission);
    console.log("handleTx:", walletType, account, chainAccount, chainNetwork, permission, transaction);
    let signOptions = {
      walletType:walletType || '',
      account:account || '',
      broadcast:false,  //if broadcast=true, ore id will broadcast the transaction to the chain network for you 
      chainAccount:chainAccount || '',
      chainNetwork:chainNetwork || '',
      state:'abc',  //anything you'd like to remember after the callback
      transaction,
      accountIsTransactionPermission:false
    }
    let signResponse = await oreId.sign(signOptions);
    //if the sign responds with a signUrl, then redirect the browser to it to call the signing flow
    let { signUrl, signedTransaction } = signResponse || {};
    if(signUrl) {
      //redirect browser to signUrl
      window.location = signUrl;
    }
    if(signedTransaction) {
      this.setState({signedTransaction:JSON.stringify(signedTransaction)});
    }
  } catch (error) {
    this.setState({errorMessage:error.message});
  }
}

/*
   Handle the authCallback coming back from ORE-ID with an "account" parameter indicating that a user has logged in
*/
async handleAuthCallback() {
  const url = window.location.href;
  if (/authcallback/i.test(url)) {
    const {account, errors, state} = await oreId.handleAuthResponse(url);
    if(!errors) {
      const userInfo = await oreId.getUserInfoFromApi(account);
      this.setState({userInfo, isLoggedIn:true});
    }
  }
}

/*
   Handle the signCallback coming back from ORE-ID with a "signedTransaction" parameter providing the transaction object with signatures attached
*/
async handleSignCallback() {
  const url = window.location.href;
  if (/signcallback/i.test(url)) {
    console.log(`got to handleSignCallback`);
    const {signedTransaction, state, errors} = await oreId.handleSignResponse(url);
    if(!errors && signedTransaction) {
      this.setState({signedTransaction:JSON.stringify(signedTransaction)});
    }
    else {
      this.setState({errorMessage:errors.join(", ")});
    }
  }
}

handleLogout() {
  this.setState({userInfo:{}, isLoggedIn:false});
  oreId.logout(); //clears local user state (stored in local storage or cookie)
}

handleSelectPermission(permissionIndex) {
  let {chainAccount, chainNetwork, permission, walletType} = this.permissionsToRender[permissionIndex] || {};
  let {accountName} = this.state.userInfo;
  walletType = walletType || 'oreid';  //default to ore id
  this.handleSignSampleTransaction(walletType, accountName, chainAccount, chainNetwork, permission);
}

getSampleTransaction(actor, permission = 'active') {
  actor = 'traylewineos';
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
      quantity: "0.0001 EOS",
      memo: `random number: ${Math.random()}`
    }
  };
  return transaction;
}

render() {
  return (
    <div>
      <div>
        {!this.state.isLoggedIn &&
          this.renderLoginButtons()
        }
        {this.state.isLoggedIn &&
          this.renderUserInfo()
        }
        {this.state.isLoggedIn &&
          this.renderSigningOptions()
        }
      </div>
      <div style={{color:'red', margin:'50px'}}>
        {(this.state.errorMessage) && this.state.errorMessage}
      </div>
      <div style={{color:'blue', margin:'50px'}}>
        {(this.state.signedTransaction) && this.state.signedTransaction}
      </div>
    </div>
  );
}

renderUserInfo() {
  console.log(`this.state.userInfo:`,this.state.userInfo);
  const {accountName, email, name, picture, username} = this.state.userInfo;
  return (
    <div>
      <h3>User Info</h3>
      <img src={picture} style={{width:50,height:50}}/><br/>
      accountName: {accountName}<br/>
      name: {name}<br/>
      username: {username}<br/>
      email: {email}<br/>
      <button onClick={this.handleLogout}  style={{ marginTop:20, padding: '10px', backgroundColor: '#FFFBE6', borderRadius: '5px'}}>
        Logout
      </button>
    </div>
  );
}

renderSigningOptions() {
  let {accountName, email, name, picture, username, permissions} = this.state.userInfo;
  let chainNetworks = (permissions || []).map(p => p.chainNetwork);
  this.permissionsToRender = permissions.slice(0); //copy
  console.log(`permissionsToRender`,this.permissionsToRender)
  this.permissionsToRender.push({walletType:'scatter', chainNetwork:'eos_main'});
  this.permissionsToRender.push({walletType:'ledger', chainNetwork:'eos_main'});
  return (
    <div>
        <div style={{marginTop:50}}>
          <h3>Choose an option to try signing a transaction</h3>
          <ul>
            {this.signButtons(this.permissionsToRender)}
          </ul>
        </div>
    </div>
  );
}

//render one sign transaction button for each chain
signButtons = (permissions) => 
  permissions.map((permission, index) =>  {
    let walletType = permission.walletType || 'oreid';
    return (
    <div style={{alignContent:'center'}}>
      <LoginButton provider={walletType} data-tag={index} buttonStyle={{width:225, marginLeft:-20, marginTop:20, marginBottom:10}} text={`Sign with ${walletType}`} onClick={() => {this.handleSelectPermission(index)}}>{`Sign Transaction with ${walletType}`}</LoginButton>
      {`Chain:${permission.chainNetwork} ---- Account:${permission.chainAccount} ---- Permission:${permission.permission}`}
    </div>
    )
  });

renderLoginButtons() {
  return (
    <div>
      <LoginButton provider='scatter'
                    buttonStyle={{width:250}}
                    logoStyle={{marginLeft:0}}
                    onClick={()=>this.handleLogin("scatter")}
                    //  text='Log in with Scatter'
      />
      <LoginButton provider='facebook'
                  buttonStyle={{width:250, marginTop:'24px'}}
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
