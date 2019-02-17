import dotenv from 'dotenv';
import React, { Component } from 'react';
import LoginButton from './components/loginButton';
import { OreId } from '@apimarket/oreid-js';
dotenv.config();

const { 
  REACT_APP_OREID_APP_ID: appId,              // Provided when you register your app
  REACT_APP_OREID_API_KEY:apiKey,             // Provided when you register your app
  REACT_APP_AUTH_CALLBACK:authCallbackUrl,    // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_OREID_URL:oreIdUrl,               // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR:backgroundColor  // Background color shown during login flow
} = process.env;

let oreId = new OreId({ appId, apiKey, oreIdUrl });

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

async componentWillMount() {
  this.loadUserFromLocalState();
  this.handleAuthCallback();
}

async loadUserFromLocalState() {
  const userInfo = await oreId.getUser();
  console.log(userInfo)
  if((userInfo ||{}).accountName) {
    this.setState({userInfo, isLoggedIn:true});
  }
}

async handleLogin(loginType) {
  // getOreIdAuthUrl returns a fully formed url that you can redirect a user's browser to to start the OAuth login flow
  let oreIdAuthUrl = await oreId.getOreIdAuthUrl({ loginType, callbackUrl:authCallbackUrl, backgroundColor });
  window.location = oreIdAuthUrl;
}

/*
   Handle the authCallback coming back from ORE-ID with an "account" parameter indicating that a user has logged in
*/
async handleAuthCallback() {
  const url = window.location.href;
  if (/authcallback/i.test(url)) {
    const {account, errors} = await oreId.handleAuthResponse(url);
    if(!errors) {
      const userInfo = await oreId.getUserInfoFromApi(account);
      this.setState({userInfo, isLoggedIn:true});
    }
  }
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
  console.log(`this.state.userInfo:`,this.state.userInfo);
  const {accountName, email, name, picture, username} = this.state.userInfo;
  return (
    <div>
      <img src={picture} style={{width:50,height:50}}/><br/>
      accountName: {accountName}<br/>
      name: {name}<br/>
      username: {username}<br/>
      email: {email}<br/>
      <button onClick={this.handleLogout}  style={{ padding: '10px', backgroundColor: '#FFFBE6', borderRadius: '5px'}}>
        Logout
      </button>
    </div>
  );
}

renderLoginButtons() {
  return (
    <div>
      <LoginButton provider='facebook'
                  buttonStyle={{width:250}}
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
      <LoginButton provider='line'
                  buttonStyle={{width:250, marginTop:'24px'}}
                  logoStyle={{marginLeft:0}}
                  onClick={()=>this.handleLogin("line")}
                  //  text='Log in with Line'
      />
      <LoginButton provider='kakao'
                  buttonStyle={{width:250, marginTop:'24px'}}
                  logoStyle={{marginLeft:0}}
                  onClick={()=>this.handleLogin("kakao")}
                  //  text='Log in with Kakao'
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
