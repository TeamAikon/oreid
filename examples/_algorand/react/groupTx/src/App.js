import React, { Component } from "react";
import LoginButton from "oreid-login-button";
import { OreId } from "oreid-js";
import { createOreIdWebWidget } from "oreid-webwidget";
import "./App.css";
import {
  assignGroupIdAndReturnTransactions,
  composeTxOptIn,
  composeTxTransfer,
} from "./algorand";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: "",
      isLoggedIn: false,
      signResults: "",
      userData: {},
      txType: "transfer",
      toAddress: "VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ",
    };
    this.handleSubmit = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  ALGO_CHAIN_NETWORK = "algo_test";

  REACT_APP_OREID_APP_ID = process.env.REACT_APP_OREID_APP_ID;
  REACT_APP_OREID_API_KEY = process.env.REACT_APP_OREID_API_KEY;

  // Intialize oreId
  // IMPORTANT - For a production app, you must protect your api key. A create-react-app app will leak the key since it all runs in the browser.
  // To protect the key, you need to set-up a proxy server. See https://github.com/TeamAikon/ore-id-docs/tree/master/examples/react/advanced/react-server
  myOreIdOptions = {
    appName: "ORE ID Sample App",
    appId: this.REACT_APP_OREID_APP_ID,
    apiKey: this.REACT_APP_OREID_API_KEY,
  };

  oreId = new OreId(this.myOreIdOptions);

  async componentWillMount() {
    await this.loadUser();
    this.webwidget = await createOreIdWebWidget(this.oreId, window)
  }

  /* Present a popup for the user to login
    When complete, the accessToken will be updated in oreid.auth */
  async handleLogin(event, provider) {
    event.preventDefault();
    console.log("got to handleLogin");
    this.webwidget.onAuth({
      params: { provider },
      onError: console.error,
      onSuccess: async (data) => {
        await this.loadUser();
      },
    });
  }

  /** Remove user info from local storage */
  async handleLogout() {
    this.setState({ errors: {}, userData: {}, isLoggedIn: false });
    this.oreId.logout();
    window.location = window.location.origin; // clear callback url in browser
  }

  /** Load the user from local storage - user info is automatically saved to local storage by oreId.auth.user.getData() */
  async loadUser() {
    if (!this.oreId.auth?.user?.isLoggedIn) return;
    let { user } = this.oreId.auth;
    await user.getData();
    this.setState({ userData: user.data, isLoggedIn: true });
  }

  async composeSampleTransactionAlgorand(chainAccount, txType) {
    const { toAddress } = this.state;
    const txTransfer = composeTxTransfer(chainAccount, toAddress);
    const txOptIn = composeTxOptIn(chainAccount);

    if (txType === "transfer") {
      return txTransfer;
    }

    if (txType === "optin") {
      return txOptIn;
    }

    // calculate groupId for two transactions, then return each including groupId
    const { transaction1WithGroup, transaction2WithGroup } =
      await assignGroupIdAndReturnTransactions(txOptIn, txTransfer);

    if (txType === "group") {
      return [transaction1WithGroup, transaction2WithGroup];
    }
  }

  handleTxTypeChange(e) {
    this.setState({ txType: e.target.value });
  }

  renderLoggedIn() {
    const { accountName, email, name, picture, username } = this.state.userData;
    return (
      <div style={{ marginTop: 50, marginLeft: 40 }}>
        <h4>User Info</h4>
        <img
          src={picture}
          style={{ width: 100, height: 100, paddingBottom: 30 }}
          alt={"user"}
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
        <div className="App-success">{this?.state?.signResults}</div>
        <div style={{ marginTop: 10, marginBottom: 20 }}>
          <select
            name="choice"
            value={this.state.txType}
            onChange={(e) => this.handleTxTypeChange(e)}
          >
            <option value="transfer">Transfer Example</option>
            <option value="optin">Opt-in Example</option>
            <option value="group">Group Example</option>
          </select>
        </div>
        <div className="App-button">
          <LoginButton
            provider="oreid"
            text="Sign with OreID"
            onClick={(e) => this.handleSign()}
          />
        </div>
        <br />
        <button onClick={this.handleLogout}> Logout </button>
      </div>
    );
  }

  showErrors(errors) {
    this.setState({ errors });
  }

  async handleSign() {
    const userData = this.oreId.auth.user.data;
    this.showErrors(null);

    // get first algorand (e.g. algo_test) account in user's wallet
    const signingAccount = userData.chainAccounts.find(
      (ca) => ca.chainNetwork === this.ALGO_CHAIN_NETWORK
    );

    if (!signingAccount) {
      this.showErrors(
        `User doesnt have any accounts on ${this.ALGO_CHAIN_NETWORK}`
      );
      return;
    }

    // Compose transaction contents
    const transactionBody = await this.composeSampleTransactionAlgorand(
      signingAccount.chainAccount,
      this.state.txType
    );

    console.log("transactionBody:", transactionBody);

    const transaction = await this.oreId.createTransaction({
      chainAccount: signingAccount.chainAccount,
      chainNetwork: signingAccount.chainNetwork,
      transaction: transactionBody,
      signOptions: {
        broadcast: true,
        returnSignedTransaction: false,
      },
    });

    this.webwidget.onSign({
      transaction,
      onError: ({ errors }) => {
        this.showErrors(errors);
      },
      onSuccess: ({ data }) => {
        this.setState({ oreIdResult: JSON.stringify(data, null, "\t") });
      },
    });
  }

  renderLoggedOut() {
    return (
      <div>
        <LoginButton
          provider="facebook"
          onClick={(e) => this.handleLogin(e, "facebook")}
        />
        <LoginButton
          provider="google"
          onClick={(e) => this.handleLogin(e, "google")}
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
          {this.state?.oreIdResult && (
            <div className="App-success">{this?.state?.oreIdResult}</div>
          )}
          {this.state?.errors && (
            <div className="App-error">Error: {this.state.errors}</div>
          )}
        </header>
      </div>
    );
  }
}

export default App;
