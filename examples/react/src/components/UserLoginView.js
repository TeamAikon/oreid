import React from 'react';
import SocialLoginButton from './SocialLoginButton';

function UserLoginView(props) {
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
    <div className="boxClass">
      <div className="header-title">Login to ORE ID</div>
      {renderLoginButtons()}
    </div>
  );
}

export default UserLoginView;
