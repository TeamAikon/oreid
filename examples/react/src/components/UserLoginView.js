import React from 'react';
import SocialLoginButton from './SocialLoginButton';

function UserLoginView(props) {
  const buttonBox = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
    flexDirection: 'column',
  };
  const innerButtonBox = {
    display: 'flex',
    flexDirection: 'column',
  };

  function renderLoginButtons() {
    const { clickedLogin } = props;

    return (
      <div>
        <SocialLoginButton
          provider="facebook"
          onClick={() => clickedLogin('facebook')}
          //  text='Log in with Facebook'
        />
        <SocialLoginButton
          provider="twitter"
          onClick={() => clickedLogin('twitter')}
          //  text='Log in with Twitter'
        />
        <SocialLoginButton
          provider="github"
          onClick={() => clickedLogin('github')}
          //  text='Log in with Github'
        />
        <SocialLoginButton
          provider="twitch"
          onClick={() => clickedLogin('twitch')}
          //  text='Log in with Twitch'
        />
        <SocialLoginButton
          provider="line"
          onClick={() => clickedLogin('line')}
          //  text='Log in with Line'
        />
        <SocialLoginButton
          provider="kakao"
          onClick={() => clickedLogin('kakao')}
          //  text='Log in with Kakao'
        />
        <SocialLoginButton
          provider="linkedin"
          onClick={() => clickedLogin('linkedin')}
          //  text='Log in with LinkedIn'
        />
        <SocialLoginButton
          provider="google"
          onClick={() => clickedLogin('google')}
          //  text='Log in with Google'
        />
        <SocialLoginButton
          provider="email"
          onClick={() => clickedLogin('email')}
          //  text='Log in with Scatter'
        />
        <SocialLoginButton
          provider="phone"
          onClick={() => clickedLogin('phone')}
          //  text='Log in with Scatter'
        />
      </div>
    );
  }

  return (
    <div style={buttonBox}>
      <div>Login to ORE ID</div>

      <div style={innerButtonBox}>{renderLoginButtons()}</div>
    </div>
  );
}

export default UserLoginView;
