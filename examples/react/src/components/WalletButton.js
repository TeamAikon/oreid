import React, { Component } from 'react';
import Button from '@material-ui/core/Button';

const validProviders = ['oreid', 'scatter', 'facebook', 'github', 'google', 'kakao', 'line', 'linkedin', 'twitch', 'twitter', 'wechat', 'ledger', 'lynx', 'meetone', 'tokenpocket'];

const defaultButtonStyle = {
  padding: '10px 24px 10px 14px',
  backgroundColor: '#3E5895',
  margin: '6px',
  color: '#ffffff',
};

const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const defaultLogoStyle = {
  width: '24px',
  height: 'auto',
};

class WalletButton extends Component {
  constructor(props) {
    super(props);
    this.checkValidProvider(this.props.provider);
    const providerStyle = require(`../assets/button-styles/${this.props.provider}-style.json`) || {}; // get the style for this provider
    this.state = {
      provider: this.props.provider,
      onClickCallback: this.props.onClick,
      buttonStyle: {
        ...defaultButtonStyle,
        ...providerStyle.buttonStyle,
        ...this.props.buttonStyle,
      },
      logoStyle: {
        ...defaultLogoStyle,
      },
      text: this.props.text || providerStyle.text,
    };
  }

  checkValidProvider(provider) {
    if (!validProviders.includes(provider)) {
      throw Error(`${provider} is not one of the supported providers. Use one of the following: ${validProviders.join(', ')}`);
    }
  }

  render() {
    // TODO: Check that provider is one of the valid types
    const { provider, onClickCallback, buttonStyle, logoStyle, text } = this.state;
    return (
      <div>
        <Button
          style={buttonStyle}
          onClick={() => {
            onClickCallback(provider);
          }}
        >
          <div style={contentStyle}>
            <img style={logoStyle} src={require(`../assets/button-styles/${provider}-logo.png`)} alt={text} />
            {text}
          </div>
        </Button>
      </div>
    );
  }
}

export default WalletButton;
