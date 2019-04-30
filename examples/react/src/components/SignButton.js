import React, { Component } from 'react';
import Button from '@material-ui/core/Button';

const validProviders = ['oreid', 'scatter', 'facebook', 'github', 'google', 'kakao', 'line', 'linkedin', 'twitch', 'twitter', 'wechat', 'ledger', 'lynx', 'meetone', 'tokenpocket'];

class SignButton extends Component {
  constructor(props) {
    super(props);
    this.checkValidProvider(this.props.provider);
    const providerStyle = require(`../assets/button-styles/${this.props.provider}-style.json`) || {}; // get the style for this provider

    this.state = {
      provider: this.props.provider,
      onClickCallback: this.props.onClick,
      logoStyle: {
        marginRight: '8px',
        ...providerStyle.logoStyle,
        ...this.props.logoStyle,
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
    const { provider, onClickCallback, logoStyle, text } = this.state;

    const providerStyle = require(`../assets/button-styles/${provider}-style.json`) || {};

    return (
      <div>
        <Button
          style={providerStyle.buttonStyle}
          onClick={() => {
            onClickCallback(provider);
          }}
        >
          <img style={logoStyle} src={require(`../assets/button-styles/${provider}-logo.png`)} alt={text} />
          {text}
        </Button>
      </div>
    );
  }
}

export default SignButton;
