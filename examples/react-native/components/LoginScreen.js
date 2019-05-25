import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LoginWebView from './LoginWebView';
import LoginButton from './loginButton';
import OreId from '../js/oreid';

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

class LoginScreen extends Component {
  async handleLogin(provider) {
    const oreIdAuthUrl = await OreId.getOreIdAuthUrl(provider);

    // show login flow in webview
    this.setState({ oreIdAuthUrl, showLoginState: 'showWeb' });
  }

  async handleCompletedCallback(loginResults) {
    const { account } = loginResults;
    let userInfo = {};

    if (account) {
      userInfo = await OreId.getUserInfoFromApi(account);
    }
    this.setState({ userInfo, showLoginState: 'webComplete' });
  }

  renderLoginMenu() {
    return (
      <View style={styles.container}>
        <LoginButton provider="facebook" onPress={() => this.handleLogin('facebook')} text="Log in with Facebook" />
        <LoginButton provider="github" onPress={() => this.handleLogin('github')} text="Log in with Github" />
        <LoginButton provider="google" onPress={() => this.handleLogin('google')} text="Log in with Google" />
        <LoginButton provider="kakao" onPress={() => this.handleLogin('kakao')} text="Log in with Kakao" />
        <LoginButton provider="linkedin" onPress={() => this.handleLogin('linkedin')} text="Log in with Linkedin" />
        <LoginButton provider="line" onPress={() => this.handleLogin('line')} text="Log in with Line" />
        <LoginButton provider="twitch" onPress={() => this.handleLogin('twitch')} text="Log in with Twitch" />
      </View>
    );
  }

  renderLoginWebView() {
    const { oreIdAuthUrl } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <LoginWebView
          completedCallback={(values) => {
            this.handleCompletedCallback(values);
          }}
          webviewUrl={oreIdAuthUrl}
        />
      </View>
    );
  }

  renderUserView() {
    const { userInfo } = this.state || {};
    const { email, name, username } = userInfo;
    return (
      <View style={{ flex: 1 }}>
        <Text>
            name:
          {' '}
          {`${name}\n`}
            email:
          {' '}
          {`${email}\n`}
            username:
          {' '}
          {`${username}\n`}
        </Text>
      </View>
    );
  }

  render() {
    const { showLoginState } = this.state || {};

    return (
      <View style={styles.page}>
        {(showLoginState === 'login' || !showLoginState) && this.renderLoginMenu()}
        {showLoginState === 'showWeb' && this.renderLoginWebView()}
        {showLoginState === 'webComplete' && this.renderUserView()}
      </View>
    );
  }
}

export default LoginScreen;

