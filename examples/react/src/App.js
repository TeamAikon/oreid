import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import UserLoginView from './components/UserLoginView';
import DiscoveryButtons from './components/DiscoveryButtons';
import Utils from './js/utils';
import SigningOptions from './components/SigningOptions';
import MessageBox from './components/MessageBox';
import ENV from './js/env';

function App(props) {
  const { ore, model } = props;

  // Similar to componentDidMount
  useEffect(() => {
    ore.loadUserFromLocalState();
    ore.handleAuthCallback();
    ore.handleSignCallback();
  }, []);

  function clearErrors() {
    model.clearErrors();
  }

  async function handleSignButton(permissionIndex) {
    clearErrors();

    const { permissions } = model.userInfo();
    const permissionsToRender = (permissions || []).slice(0);

    const { chainAccount, chainNetwork, permission, externalWalletType: provider } = permissionsToRender[permissionIndex] || {};
    const { accountName } = model.userInfo();
    // default to ore id
    await handleSignSampleTransaction(provider || 'oreid', accountName, chainAccount, chainNetwork, permission);
  }

  async function handleWalletDiscoverButton(permissionIndex) {
    try {
      clearErrors();

      const chainNetwork = ENV.chainNetwork;
      const walletButtons = [
        { provider: 'scatter', chainNetwork },
        { provider: 'ledger', chainNetwork },
        { provider: 'lynx', chainNetwork },
        { provider: 'meetone', chainNetwork },
        { provider: 'tokenpocket', chainNetwork },
      ];

      const { provider } = walletButtons[permissionIndex] || {};
      if (ore.canDiscover(provider)) {
        await ore.discover(provider);
      } else {
        console.log("Provider doesn't support discover, so we'll call login instead");
        await ore.login({ provider });
      }
      ore.loadUserFromApi(model.userInfo.accountName); // reload user from ore id api - to show new keys discovered
    } catch (error) {
      model.errorMessage = error.message;
    }
  }

  async function handleLogin(provider) {
    const args = { provider };

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

  async function handleSignSampleTransaction(provider, account, chainAccount, chainNetwork, permission) {
    try {
      clearErrors();
      const transaction = Utils.createSampleTransaction(chainAccount, permission);
      const signOptions = {
        provider: provider || '', // wallet type (e.g. 'scatter' or 'oreid')
        account: account || '',
        broadcast: false, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
        chainAccount: chainAccount || '',
        chainNetwork: chainNetwork || '',
        state: 'abc', // anything you'd like to remember after the callback
        transaction,
        accountIsTransactionPermission: false,
      };
      const signResponse = await ore.sign(signOptions);
      // if the sign responds with a signUrl, then redirect the browser to it to call the signing flow
      const { signUrl, signedTransaction } = signResponse || {};
      if (signUrl) {
        // redirect browser to signUrl
        window.location = signUrl;
      }
      if (signedTransaction) {
        model.signedTransaction = JSON.stringify(signedTransaction);
      }
    } catch (error) {
      model.errorMessage = error.message;
    }
  }

  function doRender() {
    const { isLoggedIn, userInfo, errorMessage, signedTransaction, signState } = model;
    const { permissions } = userInfo;

    const isBusy = ore.isBusy();

    const contentBox = {
      display: 'flex',
      justifyContent: 'center',
    };
    const innerContentBox = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    };

    return (
      <div>
        <div style={contentBox}>
          <div style={innerContentBox}>
            <UserLoginView isLoggedIn={isLoggedIn} clickedLogin={handleLogin} />

            <SigningOptions isLoggedIn={isLoggedIn} click={handleSignButton} permissions={permissions} />
            <DiscoveryButtons isLoggedIn={isLoggedIn} click={handleWalletDiscoverButton} />

            <MessageBox isBusy={isBusy} errorMessage={errorMessage} signedTransaction={signedTransaction} signState={signState} />
          </div>
        </div>
      </div>
    );
  }

  return doRender();
}

export default observer(App);
