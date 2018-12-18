import React, { Component } from 'react';
import {Button} from 'react-bootstrap';
import * as oreidHelper from './oreidHelper.js';
import './App.css';
require('dotenv').config();

class App extends Component {
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
    const { isLoggedIn } = this.state;

    return (
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-buttons-wrapper">
            {!isLoggedIn &&
              <Button className="facebook-login-btn" onClick={this.handleLoginClick}>
                Log in with Facebook
              </Button>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
