import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { isNullOrEmpty } from './utils';
var settings = require('./.env.json');
const { USER_ENDPOINT } = settings;

class WebViewWrapper extends React.Component {

    state = {
        key: 1,
        isWebViewUrlChanged: false
    };

    constructor(props, context) {
      super(props);
      const {params, webviewUrl, callbackUrl, oreIdAuthUrl} = props.navigation.state.params;
      if(params) {
        this.account = params["account"];
      }
      this.oreIdAuthUrl = oreIdAuthUrl;
      this.webviewUrl = webviewUrl;
      this.callbackUrl = callbackUrl;
    }

    componentWillMount() {
        this.loadUserData();
    }

    async loadUserData() {
        //Get user's data by calling proxy server
        let userUrl = `${USER_ENDPOINT}?account=${this.account}`;
        try {
            let response = await fetch( userUrl );
            const responseJson = await response.json();
            if (response.status == 200) {
                const {accountBalance, accountName, email, picture, name, username} = responseJson;
                this.setState({accountBalance, accountName, email, picture, name, username});
            }
            else {
                console.log(`Problem getting user info:`, responseJson);
            }
        } 
        catch(error) {
            console.log(`Problem getting user info:`, error);
        }
    }

    handleLogout() {
        const logoutUrl = this.constructOreIdLogoutUrl();
        console.log(`logoutUrl ${logoutUrl}`)
        if(logoutUrl) {
            this.props.navigation.navigate('LoginWebView', {webviewUrl:logoutUrl, callbackUrl:this.callbackUrl, redirectToPage:'Home'});
        }
    }

    constructOreIdLogoutUrl() {
        logoutUrl = null;
        authUrlParts = (this.oreIdAuthUrl && this.oreIdAuthUrl.split("auth#"));  // grab the base url from oreIdAuthUrl which looks like https://localhost:3000/auth#app_access_token=... 
        if(!isNullOrEmpty(authUrlParts) && authUrlParts.length > 1) {
            logoutUrl = `${authUrlParts[0]}logout?callback_url=${encodeURIComponent(this.callbackUrl)}`; 
        }
        return logoutUrl;
    }

    render() {
        const {accountBalance, accountName, email, picture, name, username} = this.state;
        return (
            <View style={styles.container}>
                <Text>Account: {accountName}</Text>
                <Text>Balance: {accountBalance}</Text>
                <Text>Name: {name}</Text>
                <Text>UserName: {username}</Text>
                <Text>Email: {email}</Text>
                <Button onPress={()=> {this.handleLogout()}} title="Logout"/>
            </View>
        );
    }
  }

  export default WebViewWrapper;


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  