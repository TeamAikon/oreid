import React, {Component} from 'react';
import * as oreidHelper from '../oreidHelper';

import facebookLogo from '../_images/logo-facebook.svg';
import twitterLogo from '../_images/logo-twitter.svg';

const loginButtonStyle = {
  padding: '10px 24px 10px 12px',
  backgroundColor: '#3E5895',
  color: '#ffffff',
  fontFamily: 'Roboto',
  fontSize: '14px',
  fontWeight: '500',
  letterSpacing: '0.25px',
  border: 'none',
  borderRadius: '5px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
}

const loginLogoStyle = {
  width: '16px',
  marginRight: '12px'
}

class SocialLoginButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      fbId: null
    };

    this.handleLoginClick = this.handleLoginClick.bind(this);
  }

  handleLoginClick(event) {
    event.preventDefault();
    const id = oreidHelper.getOreIdUrl("facebook");
    this.setState(state => ({
      isLoggedIn: !state.isLoggedIn,
      fbId: id,
    }));
  }

  renderFacebook() {
    return (
      <div>
        <button style={loginButtonStyle} onClick={this.handleLoginClick}>
          <img style={loginLogoStyle} src={facebookLogo} />Log in with Facebook
        </button>

        {/* // SCSS Button */}
        <button className="social-login-btn--facebook" onClick={this.handleLoginClick}>
          Log in with Facebook
        </button>
      </div>
    );
  }

  renderTwitter() {
    return (
      <div>
        <button style={loginButtonStyle} onClick={this.handleLoginClick}>
          <img style={loginLogoStyle} src={facebookLogo} />Log in with Facebook
        </button>

        {/* // SCSS Button */}
        <button className="social-login-btn--twitter" onClick={this.handleLoginClick}>
          Log in with Twitter
        </button>
      </div>
    );
  }

  render () {
    return (
      this.renderFacebook()
    );
  }
}

export default SocialLoginButton;