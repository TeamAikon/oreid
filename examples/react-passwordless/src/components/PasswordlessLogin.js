import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import $ from 'jquery';
import './PasswordlessLoginStyles.scss';
import ENV from '../js/env';

export default function PasswordlessLogin(props) {
  // NOTE: we are using React hooks 'useState'. This is just like React's this.state in React component classes
  // See this link for more information: https://reactjs.org/docs/hooks-overview.html
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [results, setResults] = useState('');
  const [userInfo, setUserInfo] = useState({});

  const { ore } = props;

  const setUserLoggedIn = (ui) => {
    setIsLoggedIn(true);
    setUserInfo(ui);
  };

  const loadUserFromLocalState = async () => {
    const ui = (await ore.id.getUser()) || {};

    if ((ui || {}).accountName) {
      setUserLoggedIn(ui);
    }
  };

  const displayResults = (res) => {
    if (res) {
      setResults(JSON.stringify(res, null, '  '));

      // auto resize the textarea
      const textArea = $('.resultText');
      const height = Math.min(800, textArea[0].scrollHeight);
      textArea.css('height', `${height}px`);
    } else {
      setResults('');
    }
  };

  const logout = () => {
    displayResults();
    setIsLoggedIn(false);
    setUserInfo({});

    ore.id.logout(); // clears local user state (stored in local storage or cookie)
  };

  const loadUserFromApi = async (account) => {
    try {
      const ui = (await ore.id.getUserInfoFromApi(account)) || {};
      setUserLoggedIn(ui);
    } catch (error) {
      displayResults(error);
    }
  };

  const handleAuthCallback = async () => {
    const url = window.location.href;
    if (/authcallback/i.test(url)) {
      // state is also available from handleAuthResponse, removed since not used.
      const { account, errors } = await ore.id.handleAuthResponse(url);
      if (!errors) {
        loadUserFromApi(account);
      } else {
        displayResults(errors);
      }
    }
  };

  // Similar to componentDidMount
  useEffect(() => {
    loadUserFromLocalState();
    handleAuthCallback();
  }, []);

  const handleEmailOrPhoneChange = (e) => {
    const { value } = e.target;
    setEmailOrPhone(value);
  };

  const handleCodeChange = (e) => {
    const { value } = e.target;
    setCode(value);
  };

  async function loginEmail() {
    displayResults();

    const args = {
      'login-type': 'email',
      email: emailOrPhone,
    };
    const result = await ore.id.passwordlessSendCodeApi(args);

    displayResults(result);
  }

  async function loginPhone() {
    displayResults();

    const args = {
      'login-type': 'phone',
      phone: emailOrPhone,
    };
    const result = await ore.id.passwordlessSendCodeApi(args);

    displayResults(result);
  }

  async function getUserInfo() {
    displayResults();

    const result = await ore.id.getUser();

    displayResults(result);
  }

  async function verifyEmail() {
    displayResults();

    const args = {
      'login-type': 'email',
      email: emailOrPhone,
      code,
    };
    const result = await ore.id.passwordlessVerifyCodeApi(args);

    displayResults(result);
  }

  async function verifyPhone() {
    displayResults();

    const args = {
      'login-type': 'phone',
      phone: emailOrPhone,
      code,
    };
    const result = await ore.id.passwordlessVerifyCodeApi(args);

    displayResults(result);
  }

  async function clickedLogin(provider) {
    displayResults();

    const args = { provider, code };

    switch (provider) {
      case 'phone':
        args.phone = emailOrPhone;
        break;
      case 'email':
        args.email = emailOrPhone;
        break;
      default:
        console.log('login switch not handled');
    }

    console.log(args);

    try {
      const loginResponse = await ore.id.login(args, ENV.chainNetwork);
      // if the login responds with a loginUrl, then redirect the browser to it to start the user's OAuth login flow
      // const { isLoggedIn, account, loginUrl } = loginResponse;
      const { loginUrl } = loginResponse;
      if (loginUrl) {
        // redirect browser to loginURL
        window.location = loginUrl;
        // console.log(loginUrl);
      }

      console.log(loginResponse);
    } catch (error) {
      displayResults(error);
    }
  }

  const buttonMargin = {
    marginBottom: '6px',
  };

  return (
    <div>
      <div className="boxClass">
        <div className="titleClass">ORE</div>
        <div className="subtitleClass">Passwordless Login</div>

        <div className="groupClass">
          <TextField
            id="outlined-text"
            label="Email or phone number"
            onChange={handleEmailOrPhoneChange}
            value={emailOrPhone}
            placeholder="email or phone number"
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
            variant="outlined"
          />

          <Button style={buttonMargin} variant="outlined" size="small" onClick={loginEmail} color="primary">
            Email Login
          </Button>
          <Button style={buttonMargin} variant="outlined" size="small" onClick={loginPhone} color="primary">
            Phone Login
          </Button>
        </div>

        <div className="groupClass">
          <TextField
            id="outlined-number"
            label="Verification Code"
            onChange={handleCodeChange}
            value={code}
            type="number"
            placeholder="123456"
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
            variant="outlined"
          />
          <Button style={buttonMargin} variant="outlined" size="small" onClick={verifyEmail} color="primary">
            Email Verify
          </Button>
          <Button style={buttonMargin} variant="outlined" size="small" onClick={verifyPhone} color="primary">
            Phone Verify
          </Button>
          <Button style={buttonMargin} variant="outlined" size="small" onClick={() => clickedLogin('email')} color="primary">
            Log In Email
          </Button>
          <Button style={buttonMargin} variant="outlined" size="small" onClick={() => clickedLogin('phone')} color="primary">
            Log In Phone
          </Button>
          <Button style={buttonMargin} variant="outlined" size="small" onClick={getUserInfo} color="primary">
            User Info
          </Button>
          <Button style={buttonMargin} variant="outlined" size="small" onClick={logout} color="primary">
            Logout
          </Button>
        </div>
      </div>
      <div className="boxClass">
        <div>Results</div>

        {isLoggedIn && <div>Logged In</div>}
        {userInfo && <div>{userInfo.accountName}</div>}

        <textarea readOnly wrap="off" className="resultText" value={results} />
      </div>
    </div>
  );
}
