import React, {Component} from 'react';
import Roboto from './resources/Roboto-Medium.ttf'

let validProviders=[
  'oreid',
  'scatter',
  'facebook',
  'github',
  'google',
  'kakao',
  'line',
  'linkedin',
  'twitch',
  'twitter',
  'wechat',
  'ledger',
  'lynx',
  'meetone',
  'tokenpocket'
]

var defaultButtonStyle = {
  padding: '10px 24px 10px 14px',
  backgroundColor: '#3E5895',
  color: '#ffffff',
  fontFamily: Roboto + 'sans-serif',
  fontWeight: '500',
  fontSize: '14px',
  lineHeight: '22px',
  letterSpacing: '1px',
  textAlign: 'left',
  border: 'none',
  borderRadius: '5px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
}

const defaultLogoStyle = {
  width: '24px',
  marginLeft: '10px',
  marginRight: '10px',
  verticalAlign: 'bottom'
}

class SocialLoginButton extends Component {
  constructor(props) {
    super(props)
    this.checkValidProvider(this.props.provider);
    let providerStyle=require(`./resources/${this.props.provider}-style.json`) || {}; //get the style for this provider
    this.state = {
      provider: this.props.provider,
      onClickCallback: this.props.onClick,
      buttonStyle: {...defaultButtonStyle, ...providerStyle.buttonStyle ,...this.props.buttonStyle},
      logoStyle: {...defaultLogoStyle, ...providerStyle.logoStyle, ...this.props.logoStyle},
      text: (this.props.text || providerStyle.text)
    };
  }

  checkValidProvider(provider) {
    if(!validProviders.includes(provider)) {
      throw Error(`${provider} is not one of the supported providers. Use one of the following: ${validProviders.join(', ')}`);
    }
  }

  render () {
    //TODO: Check that provider is one of the valid types
    let { provider, onClickCallback, buttonStyle, logoStyle, text} = this.state;
    return (
      <div>
        <button style={buttonStyle} onClick={() => {onClickCallback(provider)}}> 
          <img style={logoStyle} src={require(`./resources/${provider}-logo.png`)} alt={text}/>{text}
        </button>
      </div>
    );
  }
}

export default SocialLoginButton;