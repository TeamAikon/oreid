import React, {Component} from 'react';
import * as oreidHelper from '../oreidHelper';

import facebookLogo from '../_images/logo-facebook.svg';

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

  render() {
    const facebookLoginStyle = {
      padding: '10px 24px 10px 12px',
      backgroundColor: '#3E5895',
      color: '#fff',
      fontFamily: 'Roboto',
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '0.25px',
      border: 'none',
      borderRadius: '5px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    }

    const facebookLogoStyle = {
      width: '16px',
      marginRight: '12px'
    }

    return (
      <div>
        <button style={facebookLoginStyle} onClick={this.handleLoginClick}>
          <img style={facebookLogoStyle} src={facebookLogo} />Log in with Facebook
        </button>

        {/* // SCSS Button */}
        <button className="social-login-btn--facebook" onClick={this.handleLoginClick}>
          Log in with Facebook
        </button>
      </div>
    );
  }
}

export default SocialLoginButton;