import React, { Component } from 'react';
import {Button} from 'react-bootstrap';
import * as oreidHelper from './oreidHelper.js';
import './App.css';
import facebookLogo from '../src/_images/logo-facebook.svg';

import SocialLoginButton from '../src/components/SocialLoginButton';

require('dotenv').config();

class App extends Component {
  constructor(props) {
    super(props)
    this.state = { };
  }

  render() {
    return (
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-buttons-wrapper">
            <SocialLoginButton/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
