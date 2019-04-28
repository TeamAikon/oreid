import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import $ from 'jquery';
import './PasswordlessLoginStyles.scss';

export default function PasswordlessLogin(props) {
  // NOTE: we are using React hooks 'useState'. This is just like React's this.state in React component classes
  // See this link for more information: https://reactjs.org/docs/hooks-overview.html
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [code, setCode] = useState('');
  const [results, setResults] = useState('');

  const { ore } = props;

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
      email: 'steve@aikon.com',
    };
    const result = await ore.id.passwordlessSendCodeApi(args);

    displayResults(result);
  }

  async function loginPhone() {
    displayResults();

    const args = {
      'login-type': 'phone',
      phone: '+13107705341',
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
      email: 'steve@aikon.com',
      code,
    };
    const result = await ore.id.passwordlessVerifyCodeApi(args);

    displayResults(result);
  }

  async function verifyPhone() {
    displayResults();

    const args = {
      'login-type': 'phone',
      phone: '+13107705341',
      code,
    };
    const result = await ore.id.passwordlessVerifyCodeApi(args);

    displayResults(result);
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
          <Button style={buttonMargin} variant="outlined" size="small" onClick={getUserInfo} color="primary">
            User Info
          </Button>
        </div>
      </div>
      <div className="boxClass">
        <div>Results</div>

        <textarea readOnly wrap="off" className="resultText" value={results} />
      </div>
    </div>
  );
}
