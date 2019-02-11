import React from 'react';
import { View, WebView } from 'react-native';
import {urlParamsToArray} from './utils';

class LoginWebView extends React.Component {
    webviewUrl = null;
    callbackUrl = null;

    state = {
        key: 1,
        isWebViewUrlChanged: false
    };

    constructor(props, context) {
      super(props);
      const {webviewUrl, callbackUrl, redirectToPage, oreIdAuthUrl} = this.props;
      console.log('this.props:',this.props);
      this.callbackUrl = callbackUrl;
      this.redirectToPage = redirectToPage;
      this.webviewUrl = webviewUrl;
      this.oreIdAuthUrl = oreIdAuthUrl; //used to pass on to the user page so it know how to get to the logout url
      this.goBack = this.goBack.bind(this);
    }

    componentWillMount() {
    }

    resetWebViewToInitialUrl = () => {
        if (this.state.isWebViewUrlChanged) {
            this.setState({
              key: this.state.key + 1,
              isWebViewUrlChanged: false
            });
        }
    };

    goBack() {
        this.props.navigation.goBack();
    }

    setWebViewUrlChanged = webviewState => {
        console.log("webviewUrlChanged:", webviewState.url);
        if (webviewState && webviewState.url && webviewState.url.startsWith(this.callbackUrl)) {
            params = urlParamsToArray(webviewState.url);
            //redirectToPage is the page name to navigate to after the callback url is detected as having been called
            //Send whatever values were included on the callback's query parameters (urlParams) to the new page
            this.props.navigation.replace(this.redirectToPage, {params, webviewUrl:this.webviewUrl, callbackUrl:this.callbackUrl, oreIdAuthUrl:this.oreIdAuthUrl});
        }
        if (webviewState && webviewState.url !== this.webviewUrl) {
          this.setState({ isWebViewUrlChanged: true });
        }
    };

    render() {
        console.log("Render:", this.webviewUrl);
        return (
            <View style={{flex: 1}}>
                <WebView
                    ref={(ref) => {this.webview = ref;}}
                    style={{flex: 1}}
                    startInLoadingState={true}
                    source={{uri: this.webviewUrl}}
                    onNavigationStateChange={ this.setWebViewUrlChanged }
                />
            </View>
        );
    }
  }

  export default LoginWebView;
