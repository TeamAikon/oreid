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

//intialize oreId
let oreId = new OreId({ apiKey, oreIdUrl:'https://oreid.io' });

export default class App extends React.Component {
  componentWillMount () {
  }

  render() {
    return <RootStack />;
  }
}

class HomeScreen extends React.Component {

  async handleLogin(loginType) {
    navigation = this.props.navigation;
    // getOreIdAuthUrl returns a fully formed url that you can redirect a user's browser to to start the OAuth login flow
    let oreIdAuthUrl = await oreId.getOreIdAuthUrl({ loginType, callbackUrl:'https://callback.sampleapp.com', backgroundColor });
    //open webview to oreIdAuthUrl
    navigation.navigate('LoginWebView', {webviewUrl:oreIdAuthUrl, callbackUrl, redirectToPage:'UserProfile', oreIdAuthUrl});
  }

  render() {
    return (
        <View style={styles.container}>
          <LoginButton provider='facebook'
              onPress={this.handleLogin("facebook")}
              text='Log in with Facebook'
          />
          {/* <LoginButton provider='twitter'
              onPress={()=>handleLogin("twitter")}
              text='Log in with Twitter'
          /> */}
        </View>
    );
  }
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
