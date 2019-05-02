import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import $ from 'jquery';
import './PasswordlessLoginStyles.scss';
import { observer } from 'mobx-react-lite';
import { intercept } from 'mobx';
import ENV from '../js/env';

const modeEnum = {
  START: 'start',
  ASK_EMAIL: 'askEmail',
  ASK_PHONE: 'askPhone',
  VERIFY_EMAIL: 'verifyEmail',
  VERIFY_PHONE: 'verifyPhone',
};

const buttonMargin = {
  marginBottom: '6px',
};

function PasswordlessLogin(props) {
  // NOTE: we are using React hooks 'useState'. This is just like React's this.state in React component classes
  // See this link for more information: https://reactjs.org/docs/hooks-overview.html
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState(modeEnum.START);

  const { ore, model } = props;

  // auto resize the textarea
  intercept(model, 'results', (change) => {
    // must delay it since this is before value is set
    setTimeout(() => {
      const textArea = $('.resultText');
      if (textArea.length > 0) {
        const height = Math.min(800, textArea[0].scrollHeight);
        textArea.css('height', `${height}px`);
      }
    }, 10);

    return change;
  });

  // Similar to componentDidMount
  useEffect(() => {
    ore.loadUserFromLocalState();
    ore.handleAuthCallback();
  }, []);

  function handleEmailOrPhoneChange(e) {
    const { value } = e.target;
    setEmailOrPhone(value);
  }

  function handleCodeChange(e) {
    const { value } = e.target;
    setCode(value);
  }

  async function loginWithCode(provider) {
    const args = { provider, code, chainNetwork: ENV.chainNetwork };
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

    const loginResponse = await ore.login(args);
    if (loginResponse) {
      const { loginUrl } = loginResponse;
      // if the login responds with a loginUrl, then redirect the browser to it to start the user's OAuth login flow
      if (loginUrl) {
        window.location = loginUrl;
      } else {
        model.results = 'loginUrl was null';
      }
    }
  }

  function clickedLoginStyle(provider) {
    switch (provider) {
      case 'email':
        setMode(modeEnum.ASK_EMAIL);
        break;
      case 'phone':
        setMode(modeEnum.ASK_PHONE);
        break;
      default:
        console.log('login style switch failed');
        break;
    }
  }

  function clickedLogout() {
    ore.logout();
    setMode(modeEnum.START);
  }

  async function clickedRequestCode(provider) {
    const args = {
      provider,
    };

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

    const result = await ore.passwordlessSendCode(args);

    if (result.success === true) {
      switch (provider) {
        case 'email':
          setMode(modeEnum.VERIFY_EMAIL);
          break;
        case 'phone':
          setMode(modeEnum.VERIFY_PHONE);
          break;
        default:
          console.log('login style switch failed');
          break;
      }
    }
  }

  // function doRenderBusy() {
  //   return <div>Busy...</div>;
  // }

  function doRenderStart() {
    return (
      <div className="groupClass">
        <Button style={buttonMargin} variant="outlined" size="small" onClick={() => clickedLoginStyle('email')} color="primary">
          Login with Email
        </Button>

        <Button style={buttonMargin} variant="outlined" size="small" onClick={() => clickedLoginStyle('phone')} color="primary">
          Login with Phone
        </Button>
      </div>
    );
  }

  function doRenderAsk(provider) {
    let label = 'Email Address';
    let placeholder = 'example@example.com';
    let type = 'email';
    const title = 'Request Login Code';

    if (provider === 'phone') {
      label = 'Phone Number';
      placeholder = '12223334444';
      type = 'number';
    }

    return (
      <div className="groupClass">
        <TextField
          id="outlined-text"
          type={type}
          label={label}
          onChange={handleEmailOrPhoneChange}
          value={emailOrPhone}
          placeholder={placeholder}
          InputLabelProps={{
            shrink: true,
          }}
          margin="normal"
          variant="outlined"
        />

        <Button style={buttonMargin} variant="outlined" size="small" onClick={() => clickedRequestCode(provider)} color="primary">
          {title}
        </Button>
      </div>
    );
  }

  function doRenderVerify(provider) {
    return (
      <div className="groupClass">
        <div className="message">
          Check your
          {provider}
          for the verification code and enter it below.
        </div>

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
        <Button style={buttonMargin} variant="outlined" size="small" onClick={() => loginWithCode(provider)} color="primary">
          Login to ORE ID
        </Button>
      </div>
    );
  }

  function doRenderLoggedIn() {
    const { accountName, email, name, picture, username } = model.userInfo;

    return (
      <div className="groupClass">
        <div>Logged in:</div>
        <div className="user-info-box">
          <img src={picture} style={{ width: 50, height: 50 }} alt="user" />
          <div className="info-title"> accountName</div>
          <div>{accountName}</div>

          <div className="info-title"> name</div>
          <div>{name}</div>

          <div className="info-title"> username</div>
          <div>{username}</div>

          <div className="info-title"> email</div>
          <div>{email}</div>
        </div>

        <Button style={buttonMargin} variant="outlined" size="small" onClick={clickedLogout} color="primary">
          Logout
        </Button>
      </div>
    );
  }

  // render busy if anything is busy
  // if (ore.isBusy()) {
  //   return doRenderBusy();
  // }

  function doRenderPage() {
    let contents = null;

    if (model.isLoggedIn) {
      contents = doRenderLoggedIn();
    } else if (ore.waitingForLogin()) {
      contents = null;
    } else {
      // render by mode
      switch (mode) {
        case modeEnum.START:
          contents = doRenderStart();
          break;
        case modeEnum.ASK_EMAIL:
          contents = doRenderAsk('email');
          break;

        case modeEnum.ASK_PHONE:
          contents = doRenderAsk('phone');
          break;

        case modeEnum.VERIFY_EMAIL:
          contents = doRenderVerify('email');
          break;

        case modeEnum.VERIFY_PHONE:
          contents = doRenderVerify('phone');
          break;

        default:
          contents = <div>mode switch failed</div>;
          break;
      }
    }

    return (
      <div>
        <div className="boxClass">
          <div className="titleClass">ORE ID</div>
          <div className="subtitleClass">Passwordless Login</div>
          {contents}
        </div>

        <div className="boxClass">
          <div>Results</div>
          <textarea readOnly wrap="off" className="resultText" value={model.results} />
        </div>
      </div>
    );
  }

  return doRenderPage();
}

export default observer(PasswordlessLogin);
