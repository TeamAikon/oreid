import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import UserLoginView from './components/UserLoginView';
import DiscoveryButtons from './components/DiscoveryButtons';
import SigningOptions from './components/SigningOptions';
import MessageBox from './components/MessageBox';
import UserInfo from './components/UserInfo';
import './assets/App.scss';

function App(props) {
  const { ore, model } = props;

  // Similar to componentDidMount
  useEffect(() => {
    ore.loadUserFromLocalState();
    ore.handleAuthCallback();
    ore.handleSignCallback();
  }, []);

  async function handleLogin(provider) {
    const args = { provider };

    const loginResponse = await ore.login(args);
    if (loginResponse) {
      const { loginUrl } = loginResponse;
      // if the login responds with a loginUrl, then redirect the browser to it to start the user's OAuth login flow
      if (loginUrl) {
        window.location = loginUrl;
      } else {
        model.errorMessage = 'loginUrl was null';
      }
    }
  }

  function doRender() {
    const { isLoggedIn } = model;
    let contents = null;

    const isBusy = ore.isBusy();

    if (!isLoggedIn) {
      contents = <UserLoginView clickedLogin={handleLogin} />;
    } else {
      contents = (
        <div>
          <UserInfo ore={ore} model={model} />
          <SigningOptions ore={ore} model={model} />
          <DiscoveryButtons ore={ore} model={model} />

          <MessageBox isBusy={isBusy} model={model} />
        </div>
      );
    }

    return (
      <div className="app">
        <div className="app-content">
          <div className="contentBox">
            <div className="innerContentBox">{contents}</div>
          </div>
        </div>
      </div>
    );
  }

  return doRender();
}

export default observer(App);
