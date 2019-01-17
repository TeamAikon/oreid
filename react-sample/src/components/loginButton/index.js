import React, {Component} from 'react';

let validProviders=[
  'facebook',
  'github',
  'google',
  'linkedin',
  'twitch',
  'twitter'
]

var defaultButtonStyle = {
  padding: '10px 24px 10px 12px',
  backgroundColor: '#3E5895',
  color: '#ffffff',
  fontFamily: 'Roboto',
  fontSize: '18px',
  fontWeight: '500',
  letterSpacing: '0.25px',
  border: 'none',
  borderRadius: '5px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
}

const defaultLogoStyle = {
  width: '20px',
  marginRight: '12px'
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
          <img style={logoStyle} src={require(`./resources/${provider}-logo.svg`)} alt={text}/>{text}
        </button>
      </div>
    );
  }
}

export default SocialLoginButton;