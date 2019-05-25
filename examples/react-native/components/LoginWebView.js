import React, { Component } from 'react';
import { View, WebView } from 'react-native';
import { urlParamsToArray } from '../utils';

const callbackUrl = 'https://callback.sampleapp.com';

class LoginWebView extends Component {
  constructor(props) {
    super(props);

    const { completedCallback, webviewUrl } = this.props;

    this.completedCallback = completedCallback; // called when OAuth flow is done
    this.webviewUrl = webviewUrl;

    this.goBack = this.goBack.bind(this);

    this.state = {
      key: 1,
      isWebViewUrlChanged: false,
      showWebView: true
    };
  }

  resetWebViewToInitialUrl = () => {
    const { isWebViewUrlChanged, key } = this.state;

    if (isWebViewUrlChanged) {
      this.setState({
        key: key + 1,
        isWebViewUrlChanged: false
      });
    }
  };

  goBack() {
    const { navigation } = this.props;

    navigation.goBack();
  }

  //   triggered every time web page is redirected or modified
  setWebViewUrlChanged = (webviewState) => {
    if (webviewState && webviewState.url && webviewState.url.startsWith(callbackUrl)) {
      this.setState({ showWebView: false }); // hide webview so that failed redirect isnt visible

      const params = urlParamsToArray(webviewState.url);
      this.completedCallback(params);
    }
    if (webviewState && webviewState.url !== this.webviewUrl) {
      this.setState({ isWebViewUrlChanged: true });
    }
  };

  //   todo: provide a 'cancel' button above the webview to allow a user to back out
  render() {
    const { showWebView } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: this.backgroundColor }}>
        {showWebView && (
          <WebView
            ref={(ref) => { this.webview = ref; }}
            startInLoadingState
            source={{ uri: this.webviewUrl }}
            onNavigationStateChange={this.setWebViewUrlChanged}
          />
        )}
      </View>
    );
  }
}

export default LoginWebView;
