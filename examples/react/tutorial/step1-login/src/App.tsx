import {
  AuthProvider,
  OreId,
  PopupPluginErrorResults,
  UserData,
} from "oreid-js";
import LoginButton from "oreid-login-button";
// ! To use hooks from oreid-react make sure you added the OreidProvider (index.tx shows how to do this)
import { OreidProvider, useIsLoggedIn, useOreId, useUser } from "oreid-react";
import { WebWidget } from "oreid-webwidget";
import React, { useEffect, useState } from "react";
import "./App.css";

const REACT_APP_OREID_APP_ID = "demo_0097ed83e0a54e679ca46d082ee0e33a";

// * Initialize OreId
const oreId = new OreId({
	appName: "ORE ID Sample App",
	appId: REACT_APP_OREID_APP_ID,
	plugins: {
		popup: WebWidget(),
	},
});

const NotLoggedInView: React.FC = () => {
  const oreId = useOreId();
  const [errors, setErrors] = useState<string | undefined>();

  const onError = ({ errors }: PopupPluginErrorResults) => {
    console.log("Login failed", errors);
    setErrors(errors);
  };
  const onSuccess = ({ user }: { user: UserData }) => {
    console.log("Login successfull. User Data: ", user);
  };

	const loginWithOreidPopup = (provider: AuthProvider) => {
		// launch popup for user to login
    oreId.popup.auth({ provider }).then(onSuccess).catch(onError);
  };

  return (
    <>
      <div>
			<LoginButton
          provider="facebook"
          onClick={() => loginWithOreidPopup(AuthProvider.Facebook)}
        />
        <LoginButton
          provider="google"
          onClick={() => loginWithOreidPopup(AuthProvider.Google)}
        />
        <LoginButton
          provider="email"
          onClick={() => loginWithOreidPopup(AuthProvider.Email)}
        />
      </div>
      {errors && <div className="App-error">Error: {errors}</div>}
    </>
  );
};

const LoggedInView: React.FC = () => {
  const oreId = useOreId();
  const user = useUser();

  if (!user) return null;

  const { accountName, email, name, picture, username } = user;
  return (
    <div style={{ marginTop: 50, marginLeft: 40 }}>
      <h4>User Info</h4>
      <img
        src={picture.toString()}
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
      <button onClick={() => oreId.logout()}>Logout</button>
    </div>
  );
};

const AppWithProvider: React.FC = () => {
  const isLoggedIn = useIsLoggedIn();
  return (
    <div className="App">
      <header className="App-header">
        {isLoggedIn ? <LoggedInView /> : <NotLoggedInView />}
      </header>
    </div>
  );
};

export const App: React.FC = () => {
  const [oreidReady, setOreidReady] = useState(false);

  useEffect(() => {
    oreId.init().then(() => {
      setOreidReady(true);
    });
  });

  if (!oreidReady) {
    return <>Loading...</>;
  }

  return (
    <OreidProvider oreId={oreId}>
      <AppWithProvider />
    </OreidProvider>
  );
};
