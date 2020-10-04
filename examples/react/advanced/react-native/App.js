import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import LoginWebView from './LoginWebView';
import LoginButton from './components/loginButton';
import { OreId } from 'eos-auth';
var settings = require('./.env.json');

const {
  OREID_APP_ID: appId, // Provided when you register your app
  OREID_API_KEY: apiKey, // Provided when you register your app
  OREID_URL: oreIdUrl, // HTTPS Address of OREID server - refer to .env.example.json
  BACKGROUND_COLOR: backgroundColor // Background color shown during login flow
} = settings;

let callbackUrl = 'https://callback.sampleapp.com';

//intialize oreId
let oreId = new OreId({ appId, apiKey, oreIdUrl });

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}

class HomeScreen extends React.Component {
  async handleLogin(provider) {
    navigation = this.props.navigation;
    // getOreIdAuthUrl returns a fully formed url that you can redirect a user's browser to to start the OAuth login flow
    let oreIdAuthUrl = await oreId.getOreIdAuthUrl({ provider, callbackUrl, backgroundColor });
    //show login flow in webview
    this.setState({ oreIdAuthUrl, showLoginState: 'showWeb' });
  }

  async handleCompletedCallback(loginResults) {
    let { account } = loginResults;
    let userInfo = {};
    if (account) {
      userInfo = await oreId.getUserInfoFromApi(account);
    }
    this.setState({ userInfo, showLoginState: 'webComplete' });
  }

  renderLoginMenu() {
    return (
      <View style={styles.container}>
        <LoginButton provider='facebook' onPress={() => this.handleLogin('facebook')} text='Log in with Facebook' />
        <LoginButton provider='github' onPress={() => this.handleLogin('github')} text='Log in with Github' />
        <LoginButton provider='google' onPress={() => this.handleLogin('google')} text='Log in with Google' />
        <LoginButton provider='kakao' onPress={() => this.handleLogin('kakao')} text='Log in with Kakao' />
        <LoginButton provider='linkedin' onPress={() => this.handleLogin('linkedin')} text='Log in with Linkedin' />
        <LoginButton provider='line' onPress={() => this.handleLogin('line')} text='Log in with Line' />
        <LoginButton provider='twitch' onPress={() => this.handleLogin('twitch')} text='Log in with Twitch' />
      </View>
    );
  }

  renderLoginWebView() {
    let { oreIdAuthUrl } = this.state || {};
    return (
      <View style={{ flex: 1 }}>
        <LoginWebView
          completedCallback={(values) => {
            this.handleCompletedCallback(values);
          }}
          webviewUrl={oreIdAuthUrl}
          callbackUrl={callbackUrl}
          oreIdAuthUrl={oreIdAuthUrl}
        />
      </View>
    );
  }

  renderUserView() {
    let { userInfo } = this.state || {};
    let { email, name, picture, username } = userInfo;
    return (
      <View style={{ flex: 1 }}>
        <Text>
          name: {`${name}\n`}
          email: {`${email}\n`}
          username: {`${username}\n`}
        </Text>
      </View>
    );
  }

  render() {
    let { showLoginState } = this.state || {};
    return (
      <View style={styles.page}>
        {(showLoginState === 'login' || !showLoginState) && this.renderLoginMenu()}
        {showLoginState === 'showWeb' && this.renderLoginWebView()}
        {showLoginState === 'webComplete' && this.renderUserView()}
      </View>
    );
  }
}

//Navigation
const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen
  },
  {
    initialRouteName: 'Home'
  }
);

const AppContainer = createAppContainer(AppNavigator);

//Styles
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    marginTop: 150,
    marginBottom: 200,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
