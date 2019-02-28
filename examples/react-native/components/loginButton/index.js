import React, {Component} from 'react';
import { Button, Image, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import Roboto from './resources/RobotoMedium.ttf'
import { baseStyle } from './resources/_baseStyle';
import { isNullOrEmpty } from '../../utils';

let validProviders=[
  {name:'facebook', style:require('./resources/facebookStyle.js').style, logo:require('./resources/facebook-logo.png')},
  {name:'github', style:require('./resources/githubStyle.js').style, logo:require('./resources/github-logo.png')},
  {name:'google', style:require('./resources/googleStyle.js').style, logo:require('./resources/google-logo.png')},
  {name:'linkedin', style:require('./resources/linkedinStyle.js').style, logo:require('./resources/linkedin-logo.png')},
  {name:'twitch', style:require('./resources/twitchStyle.js').style, logo:require('./resources/twitch-logo.png')},
  {name:'twitter', style:require('./resources/twitterStyle.js').style, logo:require('./resources/twitter-logo.png')},
  {name:'wechat', style:require('./resources/wechatStyle.js').style, logo:require('./resources/wechat-logo.png')},
  {name:'kakao', style:require('./resources/kakaoStyle.js').style, logo:require('./resources/kakao-logo.png')},
  {name:'line', style:require('./resources/lineStyle.js').style, logo:require('./resources/line-logo.png')},
]

const containerStyle = StyleSheet.create({
  main:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
}});

class SocialLoginButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      provider: this.props.provider,
      onPressCallback: this.props.onPress,
      text: this.props.text
    };
  }

  componentDidMount() {
    this.providerInfo = this.getProviderInfo(this.props.provider);
    let providerStyle = (this.providerInfo || {}).style; //get the style for this provider
    let providerLogo = (this.providerInfo || {}).logo; //get the style for this provider
    let logoStyle = StyleSheet.create(this.props.logoStyle || {});
    let buttonStyle = StyleSheet.create(this.props.buttonStyle || {});
    let textStyle = StyleSheet.create(this.props.textStyle || {});
    let separatorLineStyle = StyleSheet.create(this.props.separatorLineStyle || {});
    this.setState({baseStyle, providerStyle, providerLogo, logoStyle, buttonStyle, textStyle, separatorLineStyle});
  }

  getProviderInfo(provider) {
    let providerInfo = validProviders.filter(p => p.name === provider);
    if(isNullOrEmpty(providerInfo)) {
      throw Error(`${provider} is not one of the supported providers. Use one of the following: ${validProviders.map(p => p.name).join(', ')}`);
    }
    return providerInfo[0];
  }

  render () {
    let { baseStyle, buttonStyle, logoStyle, onPressCallback, providerLogo, providerStyle, separatorLineStyle, text, textStyle } = this.state;
    providerStyle = providerStyle || {};
    providerLogo = providerLogo || {};
    baseStyle = baseStyle || {};
    return (
      <View style={containerStyle.main}>
        <TouchableOpacity style={[baseStyle.ButtonStyle, providerStyle.ButtonStyle, buttonStyle]} onPress={onPressCallback} activeOpacity={0.5}>
          <Image 
            source={providerLogo}
            style={[baseStyle.LogoStyle, providerStyle.LogoStyle, logoStyle]}
          />
          <View style={[baseStyle.SeparatorLineStyle, providerStyle.SeparatorLineStyle, separatorLineStyle]} />
          <Text style={[baseStyle.TextStyle, providerStyle.TextStyle, textStyle]}>{text}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default SocialLoginButton;