import React, { Component } from 'react';
import { OreId } from 'oreid-js';
import LoginButton from 'oreid-login-button';
import { withStyles } from '@material-ui/core/styles';
import OreIdWebWidget from 'oreid-react-web-widget';
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import { encode as base64Encode } from 'base-64';
import './App.css';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  whiteText: {
    color: 'white'
  },
  select: {
    width: '200px'
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      errors: '',
      isLoggedIn: false,
      authInfo: {},
      oreIdResult: '',
      showWidget: false,
      widgetActionProps: {},
      loggedProvider: ''
    };
    this.handleSubmit = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleSelectAction = this.handleSelectAction.bind(this);
    this.composeWidgetOptionsForAction = this.composeWidgetOptionsForAction.bind(this);
  }
  authCallbackUrl = `${window.location.origin}/authcallback`

  // Intialize oreId
  // IMPORTANT - For a production app, you must protect your api key. A create-react-app app will leak the key since it all runs in the browser.
  // To protect the key, you need to set-up a proxy server. See https://github.com/TeamAikon/ore-id-docs/tree/master/examples/react/advanced/react-server

  myOreIdOptions = {
    appName: "my app",
    appId: process.env.REACT_APP_OREID_APP_ID,
    authCallbackUrl: this.authCallbackUrl,
    signCallbackUrl: this.authCallbackUrl,
  }
  oreId = new OreId(this.myOreIdOptions);

  async componentWillMount() {
    await this.loadUserFromLocalStorage();
    await this.handleAuthCallback(); // handles the auth callback url
  }

  /** Call oreId.login() - this returns a redirect url which will launch the login flow (for the specified provider)
     When complete, the browser will be redirected to the authCallbackUrl (specified in oredId options) */
  async handleLogin(event, provider) {
    event.preventDefault();
    let { loginUrl } = await this.oreId.login({ provider });
    this.setState({ loggedProvider: provider }); // Save the provider to send in test flows
    window.location = loginUrl; // redirect browser to loginURL to start the login flow
  }

  /** Remove user info from local storage */
  async handleLogout() {
    this.setState({ errors: {}, userInfo: {}, isLoggedIn: false });
    this.oreId.logout();
    window.location = window.location.origin; // clear callback url in browser
  }

  /** Load the user from local storage - user info is automatically saved to local storage by oreId.getUserInfoFromApi() */
  async loadUserFromLocalStorage() {
    let accessToken = this.oreId.accessToken
    if(!accessToken) return
    let userInfo = (await this.oreId.getUser()) || {};
    this.setState({ userInfo, isLoggedIn: true });
  }
  /** Retrieve user info from ORE ID service - user info is automatically saved to local storage */
  async loadUserFromApi(account) {
    const userInfo = (await this.oreId.getUserInfoFromApi(account)) || {};
    if (userInfo.accountName) this.setState({ userInfo, isLoggedIn: true });
  }

  /** Handle the authCallback coming back from ORE ID with an "account" parameter indicating that a user has logged in */
  async handleAuthCallback() {
    const urlPath = `${window.location.origin}${window.location.pathname}`;
    if (urlPath === this.authCallbackUrl) {
      const { account, errors } = this.oreId.handleAuthResponse(
        window.location.href
      );
      if (!errors) {
        await this.loadUserFromApi(account);
        this.setState({ isLoggedIn: true });
      } else {
        this.setState({ errors });
      }
    }
  }

  /** Set widget properties for selected action */
  handleSelectAction(e) {
    const action = e.target.value
    const widgetActionProps = this.composeWidgetOptionsForAction(action)
    this.setState({ widgetActionProps, showWidget: true })
  }

  // Compose sample data

  getFirstChainAccountForUserByChainType(chainNetwork) {
    const matchingPermission = this.state?.userInfo?.permissions?.find(
      p => p.chainNetwork === chainNetwork
    );
    const { chainAccount, permission: permissionName } = matchingPermission || {};
    return { chainAccount, permissionName };
  }

  createSampleTransactionEos(actor, permission = 'active') {
    const transaction = {
      account: 'demoapphello',
      name: 'hi',
      authorization: [
        {
          actor,
          permission,
        },
      ],
      data: {
        user: actor,
      },
    };
    return transaction;
  }

  composeWidgetOptionsForAction(action) {
    const signWithChainNetwork = 'eos_kylin';
    const { accountName } = this.state.userInfo;
    const { chainAccount, permissionName } =
      this.getFirstChainAccountForUserByChainType(signWithChainNetwork);

    // compose params for sign
    if(action === 'sign') {
      return {
        name: 'sign',
        params: {
          account: accountName,
          broadcast: true, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
          chainAccount: chainAccount,
          chainNetwork: signWithChainNetwork,
          state: 'yourstate', // anything you'd like to remember after the callback
          transaction: base64Encode(
            JSON.stringify(
              this.createSampleTransactionEos(chainAccount, permissionName)
            )
          ),
          returnSignedTransaction: false,
          preventAutoSign: true, // prevent auto sign even if transaction is auto signable
        },
      }
    }
    // compose params to create an additional blockchain account
    // IMPORTANT: newAccount is for creating an ADDITIONAL blockchain account for an existing ORE ID wallet - you normally would not need to do this
    if(action === 'newAccount') {
      return {
        name: 'newAccount',
        params: {
          account: accountName,
          chainNetwork: signWithChainNetwork,
          accountType: 'native',
          provider: 'google'
        },
      }
    }
    return {}
  }

  /** Show user info and options (after logging in )*/
  renderLoggedIn() {
    const { accountName, email, name, picture, username } = this.state.userInfo;
    const { classes } = this.props
    return (
      <div style={{ marginTop: 50, marginLeft: 40 }}>
        <h4>User Info</h4>
        <img
          src={picture}
          style={{ width: 100, height: 100, paddingBottom: 30 }}
          alt={'user'}
        />
        <br />
        OreId account: {accountName}
        <br />
        name: {name}
        <br />
        username: {username}
        <br />
        email: {email}
        <br />
        <div className="App-success">{this?.state?.oreIdResult}</div>
        <FormControl variant="filled" className={classes.formControl}>
          <InputLabel id="action-selector-label" className={classes.whiteText}>Select action</InputLabel>
          <Select
            labelId="action-selector-label"
            onChange={this.handleSelectAction}
            className={classes.select}
            value={this.state.dappAction}
            inputProps={{
              classes: {
                icon: classes.whiteText,
                root: classes.whiteText
              }
            }}
          >
            <MenuItem value="sign">Sign</MenuItem>
            <MenuItem value="newAccount">New Account</MenuItem>
          </Select>
        </FormControl>
        <div>
          <Button onClick={this.handleLogout} color="secondary">Logout</Button>
        </div>
        <OreIdWebWidget
          oreIdOptions={{
            ...this.myOreIdOptions,
            accessToken: this.oreId.accessToken,
          }}
          show={this.state.showWidget}
          action={this.state.widgetActionProps}
          onSuccess={result => {
            this.setState({ oreIdResult: JSON.stringify(result, null, '\t'), showWidget:false });
          }}
          onError={result => {
            this.setState({ errors: result?.errors, showWidget:false });
          }}
        />
      </div>
    );
  }

  /** Show login options */
  renderLoggedOut() {
    return (
      <div>
        <LoginButton
          provider="facebook"
          onClick={e => this.handleLogin(e, 'facebook')}
        />
        <LoginButton
          provider="google"
          onClick={e => this.handleLogin(e, 'google')}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.state.isLoggedIn ? (
            <div>{this.renderLoggedIn()} </div>
          ) : (
            <div>{this.renderLoggedOut()} </div>
          )}
          {this.state.errors && (
            <div className="App-error">Error: {this.state.errors}</div>
          )}
        </header>
      </div>
    );
  }
}

export default withStyles(styles)(App);
