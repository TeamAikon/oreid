import React, { Component } from 'react';
import './App.css';
import * as oreIdHelper from "../src/oreidHelper.js"
import facebookLogo from '../src/_images/logo-facebook.png';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      fbId: null
    };

    this.handleLoginClick = this.handleLoginClick.bind(this);
  }

  handleLoginClick(loginType) {
    oreIdHelper.getOreIdAuthUrl(loginType);
  }

  render() {
    const { isLoggedIn } = this.state;

    const facebookLoginStyle = {
      padding: '10px 24px 10px 12px',
      backgroundColor: '#3E5895',
      color: '#fff',
      fontFamily: 'Roboto',
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '0.25px',
      borderRadius: '5px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    }

    const facebookLogoStyle = {
      width: '14px',
      marginRight: '12px'
    }

    return (
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-buttons-wrapper">
            {!isLoggedIn &&
              <button style={facebookLoginStyle} className="facebook-login-btn" onClick={this.handleLoginClick}>
                <img style={facebookLogoStyle} src={facebookLogo} />Log in with Facebook
              </button>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
