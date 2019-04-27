import React from 'react';
import Button from '@material-ui/core/Button';

const validProviders = ['oreid', 'scatter', 'facebook', 'github', 'google', 'kakao', 'line', 'linkedin', 'twitch', 'twitter', 'wechat', 'ledger', 'lynx', 'meetone', 'tokenpocket', 'email', 'phone'];

const defaultButtonStyle = {
  color: '#ffffff',
  width: 250,
  marginTop: '20px',
};

const defaultLogoStyle = {
  width: '24px',
  marginLeft: '10px',
  marginRight: '10px',
  verticalAlign: 'bottom',
};

function SocialLoginButton(props) {
  checkValidProvider(props.provider);
  const providerStyle = require(`../assets/button-styles/${props.provider}-style.json`) || {};

  const buttonStyle = {
    ...defaultButtonStyle,
    ...providerStyle.buttonStyle,
  };

  const text = props.text || providerStyle.text;

  function checkValidProvider(provider) {
    if (!validProviders.includes(provider)) {
      throw Error(`${provider} is not one of the supported providers. Use one of the following: ${validProviders.join(', ')}`);
    }
  }

  return (
    <div>
      <Button
        variant="contained"
        style={buttonStyle}
        onClick={() => {
          props.onClick(props.provider);
        }}
      >
        <img style={defaultLogoStyle} src={require(`../assets/button-styles/logo-${props.provider}.svg`)} alt={text} />
        {text}
      </Button>
    </div>
  );
}

export default SocialLoginButton;
