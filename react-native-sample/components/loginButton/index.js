import React, {Component} from 'react';
import { Button, Image, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import Roboto from './resources/Roboto-Medium.ttf'
import { isNullOrEmpty } from '../../utils';

let validProviders=[
  {name:'facebook', style:require('./resources/facebookStyle.js').styles, logo:require('./resources/facebookLogo.svg')},
  // {name:'github', style:require('./resources/github-style.json'), logo:require('./resources/github-logo.svg')},
  // {name:'google', style:require('./resources/google-style.json'), logo:require('./resources/google-logo.svg')},
  // {name:'linkedin', style:require('./resources/linkedin-style.json'), logo:require('./resources/linkedin-logo.svg')},
  // {name:'twitch', style:require('./resources/twitch-style.json'), logo:require('./resources/twitch-logo.svg')},
  // {name:'twitter', style:require('./resources/twitterStyle.js').styles, logo:require('./resources/twitterLogo.svg')},
  // {name:'wechat', style:require('./resources/wechat-style.json'), logo:require('./resources/wechat-logo.svg')},
  // {name:'kakao', style:require('./resources/kakao-style.json'), logo:require('./resources/kakao-logo.svg')},
  // {name:'line', style:require('./resources/line-style.json'), logo:require('./resources/line-logo.svg')},
]

// var defaultButtonStyle = {
//   padding: '10px 24px 10px 14px',
//   backgroundColor: '#3E5895',
//   color: '#ffffff',
//   fontFamily: Roboto + 'sans-serif',
//   fontWeight: '500',
//   fontSize: '14px',
//   lineHeight: '22px',
//   letterSpacing: '1px',
//   textAlign: 'left',
//   border: 'none',
//   borderRadius: '5px',
//   boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
// }

// const defaultLogoStyle = {
//   width: '24px',
//   marginRight: '14px',
//   verticalAlign: 'bottom'
// }

const containerStyle = StyleSheet.create({main:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
}});

class SocialLoginButton extends Component {
  constructor(props) {
    super(props)
    this.providerInfo = this.getProviderInfo(this.props.provider);
    this.state = {
      provider: this.props.provider,
      onPressCallback: this.props.onPress,
      text: this.props.text
    };
  }

  componentDidMount() {
    let providerStyle = this.providerInfo.style || {}; //get the style for this provider
    let buttonStyle = [providerStyle.ButtonStyle, StyleSheet.create(this.props.buttonStyle)];
    let logoStyle = [providerStyle.LogoStyle, StyleSheet.create(this.props.logoStyle)];
    let textStyle = [providerStyle.TextStyle, StyleSheet.create(this.props.textStyle)];
    let separatorLineStyle = [providerStyle.SeparatorLineStyle, StyleSheet.create(this.props.separatorLineStyle)];
    this.setState({buttonStyle, logoStyle, textStyle, separatorLineStyle});
  }

  getProviderInfo(provider) {
    let providerInfo = validProviders.filter(p => p.name === provider);
    if(isNullOrEmpty(providerInfo)) {
      throw Error(`${provider} is not one of the supported providers. Use one of the following: ${validProviders.map(p => p.name).join(', ')}`);
    }
    return providerInfo[0];
  }

  render () {
    //TODO: Check that provider is one of the valid types
    let { provider, onPressCallback, buttonStyle, logoStyle, textStyle, text, separatorLineStyle} = this.state;
    let { style, logo } = this.providerInfo;
    return (
      <View style={containerStyle.main}>
        <TouchableOpacity style={buttonStyle} onPress={() => {onPressCallback(provider)}} activeOpacity={0.5}>
          <Image 
            source={logo}
            style={logoStyle}
          />
          <View style={separatorLineStyle} />
          <Text style={textStyle}>{text}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default SocialLoginButton;