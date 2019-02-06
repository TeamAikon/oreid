import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import UserProfile from './UserProfile';
import WebViewWrapper from './WebViewWrapper';
import LoginButton from './components/loginButton';
import { OreId } from '@apimarket/oreid-js';
import {observer, inject} from 'mobx-react';
var settings = require('./.env.json');

const { 
  REACT_APP_OREID_API_KEY:apiKey,             // Provided when you register your app
  REACT_APP_BACKGROUND_COLOR:backgroundColor  // Background color shown during login flow
} = settings;

let callbackUrl = 'https://callback.sampleapp.com';

//intialize oreId
let oreId = new OreId({ apiKey, oreIdUrl:'https://staging.oreid.io' });

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}

class HomeScreen extends React.Component {

  async handleLogin(loginType) {
    navigation = this.props.navigation;
    // getOreIdAuthUrl returns a fully formed url that you can redirect a user's browser to to start the OAuth login flow
    console.log(`handleLogin ${loginType}`);
    let oreIdAuthUrl = await oreId.getOreIdAuthUrl({ loginType, callbackUrl, backgroundColor });
    //open webview to oreIdAuthUrl
    navigation.navigate('LoginWebView', {webviewUrl:oreIdAuthUrl, callbackUrl, redirectToPage:'UserProfile', oreIdAuthUrl});
  }

  render() {
    return (
      <View style={styles.page}>
        <View style={styles.container}>
          <LoginButton provider='facebook'
              onPress={() => this.handleLogin("facebook")}
              text='Log in with Facebook'
          />
          <LoginButton provider='github'
              onPress={()=> this.handleLogin("github")}
              text='Log in with Github'
          />
          <LoginButton provider='google'
              onPress={()=> this.handleLogin("google")}
              text='Log in with Google'
          />
          <LoginButton provider='kakao'
              onPress={()=> this.handleLogin("kakao")}
              text='Log in with Kakao'
          />
          <LoginButton provider='line'
              onPress={()=> this.handleLogin("line")}
              text='Log in with Line'
          />
          <LoginButton provider='linkedin'
              onPress={()=> this.handleLogin("linkedin")}
              text='Log in with Linkedin'
          />
          <LoginButton provider='twitch'
              onPress={()=> this.handleLogin("twitch")}
              text='Log in with Twitch'
          />
          <LoginButton provider='wechat'
              onPress={()=> this.handleLogin("wechat")}
              text='Log in with WeChat'
          />
        </View>
      </View>
    );
  }
}

//Navigation
const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    LoginWebView: WebViewWrapper,
    UserProfile: UserProfile,
  },
  {
    initialRouteName: 'Home',
  }
);

//Styles
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    marginTop:150,
    marginBottom:200,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

