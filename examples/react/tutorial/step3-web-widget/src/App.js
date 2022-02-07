// @ts-check
/* eslint-disable no-unused-vars */
import React, { Dispatch, SetStateAction, useState, useMemo, useEffect } from "react";
import {
  AccountType,
  AuthProvider,
  OreIdProvider,
  OreId,
  User,
  OreIdOptions,
  SignOptions,
  NewAccountOptions,
  GetOreIdRecoverAccountUrlParams,
} from "oreid-js";
import { DappAction, WebWidgetProps } from "oreid-js/dist/webwidget";
import OreIdWebWidget from "oreid-react-web-widget";
import LoginButton from "oreid-login-button";
import { makeStyles } from "@material-ui/core/styles";
import { ButtonGroup, Snackbar } from "@material-ui/core";
import Alert, { Color } from "@material-ui/lab/Alert";
import algoSignerProvider from "eos-transit-algosigner-provider";
import keycatProvider from "eos-transit-keycat-provider";
import ledgerProvider from "eos-transit-ledger-provider";
import lynxProvider from "eos-transit-lynx-provider";
import meetoneProvider from "eos-transit-meetone-provider";
import portisProvider from "eos-transit-portis-provider";
import scatterProvider from "eos-transit-scatter-provider";
import simpleosProvider from "eos-transit-simpleos-provider";
import tokenpocketProvider from "eos-transit-tokenpocket-provider";
import web3Provider from "eos-transit-web3-provider";
import { encode as base64Encode } from "base-64";
import UserOreId from "./UserOreId";

const oreIdCallback = `${window.location.origin}/oreidcallback`;

/** @type {Object.<string, Color>} */
const Severity = {
  Info: "info",
  Warning: "warning",
  Success: "success",
  Error: "error",
};

/**
 * @typedef {{
 *   warning?: string,
 *   error?: string,
 *   success?: string,
 *   info?: string,
 * }} Logs
 */

const oreIdUrl = {
  app: "https://dev.oreid.io",
  auth: "https://dev.service.oreid.io",
};

/** @type OreIdOptions  */
const myOreIdOptions = {
  appId: "demo_0097ed83e0a54e679ca46d082ee0e33a",
  oreIdUrl: oreIdUrl.auth,
  authCallbackUrl: oreIdCallback,
  signCallbackUrl: oreIdCallback,
  eosTransitWalletProviders: [
    // @ts-ignore
    algoSignerProvider(),
    keycatProvider(),
    ledgerProvider(),
    lynxProvider(),
    meetoneProvider(),
    portisProvider(),
    scatterProvider(),
    simpleosProvider(),
    tokenpocketProvider(),
    // @ts-ignore
    web3Provider(),
  ],
};

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: "#282c34",
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  buttons: {
    display: "grid",
    gridTemplateColumns: "225px 225px 225px",
    gridTemplateRows: "50px 50px 50px 50px",
    gridGap: theme.spacing(2),
    "& button:hover": {
      cursor: "pointer",
    },
  },
}));

export default function App() {
  /** @type {[User, Dispatch<SetStateAction<User>>]} */
  const [userInfo, setUserInfo] = useState(null);
  /** @type {[Logs, Dispatch<SetStateAction<Logs>>]} */
  const [logs, setLogs] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  /** @type {[boolean, Dispatch<SetStateAction<boolean>>]} */
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [showWidget, setShowWidget] = useState(false);
  /** @type {[WebWidgetProps['action'], Dispatch<SetStateAction<WebWidgetProps['action']>>]} */
  const [widgetAction, setWidgetAction] = useState(null);
  /** @type {[AuthProvider, Dispatch<SetStateAction<AuthProvider>>]} */
  const [loggedProvider, setLoggedProvider] = useState(null);
  /** @type {[Color, Dispatch<SetStateAction<Color>>]} */
  const [severity, setSeverity] = useState(null);

  const styles = useStyles();

  // Intialize oreId
  // IMPORTANT - For a production app, you must protect your api key. A create-react-app app will leak the key since it all runs in the browser.
  // To protect the key, you need to set-up a proxy server. See https://github.com/TeamAikon/ore-id-docs/tree/master/examples/react/advanced/react-server
  const oreId = useMemo(() => {
    const myOreId = new OreId(myOreIdOptions);
    // inject oreId object into window for user accessibility
    // @ts-ignore
    window.oreId = myOreId;
    return myOreId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Call oreId.login() - this returns a redirect url which will launch the login flow (for the specified provider)
   When complete, the browser will be redirected to the authCallbackUrl (specified in oredId options) */
  const handleLogin = async (event, provider) => {
    event.preventDefault();
    const response = await oreId.login({ provider });
    // redirect browser to loginURL to start the login flow
    if (response?.loginUrl) window.location.href = response.loginUrl;
  };

  const handleUserInfo = (userInfo) => {
    if (userInfo?.accountName) {
      setUserInfo(Object.freeze(userInfo));
      setIsLoggedIn(true);
      // Save the provider to send in test flows
      setLoggedProvider(oreId.accessTokenHelper?.decodedToken["https://oreid.aikon.com/provider"]);
      return;
    }
    setUserInfo(null);
    setIsLoggedIn(false);
    setLoggedProvider(null);
  };

  /** Remove user info from local storage */
  const handleLogout = () => {
    oreId.logout();
    handleUserInfo(null);
    setLogs({ [Severity.Info]: "Logged Out Successfully!" });
  };

  /** Load the user from local storage - user info is automatically saved to local storage by oreId.getUserInfoFromApi() */
  const loadUserFromLocalStorage = async () => {
    if (!oreId.accessToken) return;
    const userInfo = await oreId.getUser();
    handleUserInfo(userInfo);
  };

  /** Retrieve user info from ORE ID service - user info is automatically saved to local storage */
  const loadUserFromApi = async (account) => {
    const userInfo = await oreId.getUserInfoFromApi(account);
    handleUserInfo(userInfo);
  };

  const handleOreIdCallback = () => {
    const urlPath = `${window.location.origin}${window.location.pathname}`;
    if (urlPath === myOreIdOptions.authCallbackUrl) {
      const { errors } = oreId.handleAuthResponse(window.location.href);
      if (!errors) {
        window.location.replace("/");
      } else {
        setLogs({ [Severity.Error]: errors.join(" ") });
      }
    }
  };

  const handleSignString = async ({ chainNetwork, walletType, onSuccess }) => {
    try {
      const { signedString } = await oreId.signString({
        account: userInfo?.accountName,
        provider: walletType,
        chainNetwork,
        string: "Verify your Account",
        message: "",
      });
      console.log({ signedString });
      setTimeout(() => {
        loadUserFromApi(userInfo?.accountName);
      }, 2000);
      if (signedString) {
        setLogs({ [Severity.Success]: "Account Added Successfully!" });
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      setLogs({ [Severity.Error]: error.message });
    }
  };

  // compose params for action
  const composeWidgetOptionsForAction = (action, args) => {
    switch (action) {
      case DappAction.Sign:
        if (!args?.chainAccountPermission) {
          setLogs({ [Severity.Error]: "Please select a Permission to use for Action" });
          return;
        }
        const { chainAccount, chainNetwork, privateKeyStoredExterally } = args.chainAccountPermission;
        /** @type {{name: DappAction.Sign, params: SignOptions}} */
        const signActionProps = {
          name: DappAction.Sign,
          params: {
            allowChainAccountSelection: privateKeyStoredExterally,
            account: userInfo?.accountName,
            broadcast: true, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
            chainAccount,
            chainNetwork,
            state: "yourstate", // anything you'd like to remember after the callback
            transaction: base64Encode(args?.transaction),
            returnSignedTransaction: false,
            preventAutoSign: true, // prevent auto sign even if transaction is auto signable
          },
        };
        return signActionProps;
      case DappAction.NewAccount:
        // compose params to create an additional blockchain account
        // IMPORTANT: newAccount is for creating an ADDITIONAL blockchain account for an existing ORE ID wallet - you normally would not need to do this
        /** @type {{name: DappAction.NewAccount, params: NewAccountOptions}} */
        const newAccountActionProps = {
          name: DappAction.NewAccount,
          params: {
            account: userInfo?.accountName,
            chainNetwork: args?.chainNetwork,
            accountType: AccountType.Native,
            provider: loggedProvider,
          },
        };
        return newAccountActionProps;
      case DappAction.RecoverAccount:
        /** @type {{name: DappAction.RecoverAccount, params: GetOreIdRecoverAccountUrlParams}} */
        const recoverAccountActionProps = {
          name: DappAction.RecoverAccount,
          params: {
            account: userInfo?.accountName,
            provider: loggedProvider,
          },
        };
        return recoverAccountActionProps;
      default:
        return null;
    }
  };

  /** Set widget properties for selected action */
  const handleAction = async (action, args) => {
    const widgetActionProps = composeWidgetOptionsForAction(action, args);
    setWidgetAction(widgetActionProps);
    setShowWidget(!!widgetActionProps);
  };

  /** Handle the authCallback coming back from ORE ID with an "account" parameter indicating that a user has logged in */
  useEffect(() => {
    // handles the auth callback url
    loadUserFromLocalStorage().then(() => {
      handleOreIdCallback();
      !oreId.accessToken && setIsLoggedIn(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (logs.info) setSeverity(Severity.Info);
    else if (logs.warning) setSeverity(Severity.Warning);
    if (logs.success) setSeverity(Severity.Success);
    else if (logs.error) setSeverity(Severity.Error);
    if (logs?.info || logs?.error || logs?.warning || logs?.success) setOpenSnackbar(true);
  }, [logs.error, logs.success, logs.warning, logs.info]);

  /** @type WebWidgetProps['onSuccess'] */
  const handleWidgetSuccess = (result) => {
    setShowWidget(false);
    console.log(JSON.stringify(result, null, 2));
    switch (widgetAction.name) {
      case DappAction.Sign:
        setLogs({ [Severity.Success]: "Signed Transaction Successfully!" });
        break;
      case DappAction.NewAccount:
        setLogs({ [Severity.Success]: `New Account ${result?.data["chain_account"] || ""} Created Successfully!` });
        break;
      case DappAction.RecoverAccount:
        setLogs({ [Severity.Success]: "Recovered Password Successfully!" });
        break;
      default:
        break;
    }
    setWidgetAction(null);
  };

  /** @type WebWidgetProps['onError'] */
  const handleWidgetError = (result) => {
    result?.data && console.error(result.data);
    setShowWidget(false);
    setLogs({ [Severity.Error]: result?.errors || "An error occured" });
    setWidgetAction(null);
  };

  return (
    <div className={styles.container}>
      {isLoggedIn !== null && (
        <>
          {isLoggedIn ? (
            <>
              <UserOreId
                appId={myOreIdOptions.appId}
                oreIdAppUrl={oreIdUrl.app}
                userInfo={userInfo}
                onAction={handleAction}
                onConnectWallet={handleSignString}
                onLogout={handleLogout}
                onRefresh={() => loadUserFromApi(userInfo?.accountName)}
              />
              <OreIdWebWidget
                oreIdOptions={{
                  ...myOreIdOptions,
                  accessToken: oreId?.accessToken,
                }}
                show={showWidget}
                action={widgetAction}
                onSuccess={handleWidgetSuccess}
                onError={handleWidgetError}
                timeout={null}
              />
            </>
          ) : (
            <ButtonGroup className={styles.buttons}>
              {/* Supported Login Options */}
              {Object.keys(OreIdProvider)
                .filter((oreIdProvider) => OreIdProvider[oreIdProvider] !== OreIdProvider.Custodial)
                .map((oreIdProvider) => (
                  // @ts-ignore
                  <LoginButton
                    key={oreIdProvider}
                    provider={OreIdProvider[oreIdProvider]}
                    onClick={(e) => handleLogin(e, OreIdProvider[oreIdProvider])}
                  />
                ))}
            </ButtonGroup>
          )}
        </>
      )}
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity={severity}>{logs[severity]}</Alert>
      </Snackbar>
    </div>
  );
}
