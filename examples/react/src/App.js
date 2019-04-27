import React, { Component } from 'react';
import { observer } from 'mobx-react';
import HeaderBar from './components/HeaderBar';
import UserLoginView from './components/UserLoginView';
import ORE from './js/ore';
import EOSRpc from './js/eosRpc';
import DiscoveryButtons from './components/DiscoveryButtons';
import Utils from './js/utils';
import SigningOptions from './components/SigningOptions';
import MessageBox from './components/MessageBox';

const chainNetworkForExample = 'eos_kylin';

const App = observer(
  class App extends Component {
    constructor(props) {
      super(props);

      this.ore = new ORE();

      this.stagingRpc = new EOSRpc('https://ore-staging.openrights.exchange');
      this.eosRpc = new EOSRpc('https://kylin.eoscanada.com');

      this.handleLogin = this.handleLogin.bind(this);
      this.handleLogout = this.handleLogout.bind(this);
      this.handleSignButton = this.handleSignButton.bind(this);
      this.handleWalletDiscoverButton = this.handleWalletDiscoverButton.bind(this);
    }

    async componentWillMount() {
      this.loadUserFromLocalState();
      this.handleAuthCallback();
      this.handleSignCallback();
    }

    setUserLoggedIn(userInfo) {
      this.props.model.isLoggedIn = true;
      this.props.model.userInfo = userInfo;
    }

    async loadUserFromLocalState() {
      const userInfo = (await this.ore.id.getUser()) || {};

      if ((userInfo || {}).accountName) {
        this.setUserLoggedIn(userInfo);
      }
    }

    async loadUserFromApi(account) {
      try {
        const userInfo = (await this.ore.id.getUserInfoFromApi(account)) || {};
        this.setUserLoggedIn(userInfo);
      } catch (error) {
        this.props.model.errorMessage = error.message;
      }
    }

    clearErrors() {
      this.props.model.clearErrors();
    }

    handleLogout() {
      this.clearErrors();
      this.props.model.isLoggedIn = false;
      this.props.model.userInfo = {};

      this.ore.id.logout(); // clears local user state (stored in local storage or cookie)
    }

    async handleSignButton(permissionIndex) {
      this.clearErrors();
      const { chainAccount, chainNetwork, permission, externalWalletType: provider } = this.permissionsToRender[permissionIndex] || {};
      const { accountName } = this.props.model.userInfo;
      // default to ore id
      await this.handleSignSampleTransaction(provider || 'oreid', accountName, chainAccount, chainNetwork, permission);
    }

    async handleWalletDiscoverButton(permissionIndex) {
      const chainNetwork = chainNetworkForExample;
      try {
        this.clearErrors();
        const { provider } = this.walletButtons[permissionIndex] || {};
        if (this.ore.id.canDiscover(provider)) {
          await this.ore.id.discover(provider, chainNetwork);
        } else {
          console.log("Provider doesn't support discover, so we'll call login instead");
          await this.ore.id.login({ provider, chainNetwork });
        }
        this.loadUserFromApi(this.props.model.userInfo.accountName); // reload user from ore id api - to show new keys discovered
      } catch (error) {
        this.props.model.errorMessage = error.message;
      }
    }

    async handleLogin(provider) {
      const chainNetwork = chainNetworkForExample;
      try {
        this.clearErrors();
        const loginResponse = await this.ore.id.login({ provider, chainNetwork });
        // if the login responds with a loginUrl, then redirect the browser to it to start the user's OAuth login flow
        const { isLoggedIn, account, loginUrl } = loginResponse;
        if (loginUrl) {
          // redirect browser to loginURL
          window.location = loginUrl;
        }

        this.props.model.userInfo.accountName = account;
        this.props.model.isLoggedIn = isLoggedIn;
      } catch (error) {
        this.props.model.errorMessage = error.message;
      }
    }

    async handleSignSampleTransaction(provider, account, chainAccount, chainNetwork, permission) {
      try {
        this.clearErrors();
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
        const signResponse = await this.ore.id.sign(signOptions);
        // if the sign responds with a signUrl, then redirect the browser to it to call the signing flow
        const { signUrl, signedTransaction } = signResponse || {};
        if (signUrl) {
          // redirect browser to signUrl
          window.location = signUrl;
        }
        if (signedTransaction) {
          this.props.model.signedTransaction = JSON.stringify(signedTransaction);
        }
      } catch (error) {
        this.props.model.errorMessage = error.message;
      }
    }

    /*
     Handle the authCallback coming back from ORE-ID with an "account" parameter indicating that a user has logged in
  */
    async handleAuthCallback() {
      const url = window.location.href;
      if (/authcallback/i.test(url)) {
        // state is also available from handleAuthResponse, removed since not used.
        const { account, errors } = await this.ore.id.handleAuthResponse(url);
        if (!errors) {
          this.loadUserFromApi(account);
        }
      }
    }

    /*
     Handle the signCallback coming back from ORE-ID with a "signedTransaction" parameter providing the transaction object with signatures attached
  */
    async handleSignCallback() {
      const url = window.location.href;
      if (/signcallback/i.test(url)) {
        const { signedTransaction, state, errors } = await this.ore.id.handleSignResponse(url);
        if (!errors && signedTransaction) {
          this.props.model.signedTransaction = JSON.stringify(signedTransaction);
          this.props.model.signState = state;
        } else {
          this.props.model.errorMessage = errors.join(', ');
        }
      }
    }

    render() {
      const { isLoggedIn, userInfo, errorMessage, signedTransaction, signState } = this.props.model;
      const { permissions } = userInfo;

      const isBusy = this.ore.isBusy();

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
          <HeaderBar logout={this.handleLogout} isLoggedIn={isLoggedIn} userInfo={userInfo} />
          <div style={contentBox}>
            <div style={innerContentBox}>
              <UserLoginView isLoggedIn={isLoggedIn} clickedLogin={this.handleLogin} />

              <SigningOptions isLoggedIn={isLoggedIn} click={this.handleSignButton} permissions={permissions} />
              <DiscoveryButtons isLoggedIn={isLoggedIn} chainNetworkForExample={chainNetworkForExample} click={this.handleWalletDiscoverButton} />

              <MessageBox isBusy={isBusy} errorMessage={errorMessage} signedTransaction={signedTransaction} signState={signState} />
            </div>
          </div>
        </div>
      );
    }
  },
);

export default App;
