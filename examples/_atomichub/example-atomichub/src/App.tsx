import { AuthProvider, OreId, UserData } from "oreid-js";
import LoginButton from "oreid-login-button";
// ! To use hooks from oreid-react make sure you added the OreidProvider (index.tx shows how to do this)
import { OreidProvider, useIsLoggedIn, useOreId, useUser } from "oreid-react";
import { WebWidget } from "oreid-webwidget";
import React, { useEffect, useState } from "react";
import "./App.css";
import { AtomicHub } from "./AtomicHub";
import { Button } from "./Button";

const REACT_APP_OREID_APP_ID = "t_4683afc074ab444ebdf1bf08ed8d1757";

// * Initialize OreId
const oreId = new OreId({
	appName: "ORE ID Sample App",
	appId: REACT_APP_OREID_APP_ID,
	oreIdUrl: "https://dev.service.oreid.io",
	plugins: {
		popup: WebWidget(),
	},
});

// @ts-ignore
window.oreId = oreId;

const NotLoggedInView: React.FC = () => {
	const oreIdFromContext = useOreId();
	const [error, setError] = useState<Error | null>();

	const onError = (error: Error) => {
		console.log("Login failed", error);
		setError(error);
	};
	const onSuccess = ({ user }: { user: UserData }) => {
		console.log("Login successfull. User Data: ", user);
	};

	return (
		<>
			<div>
				<LoginButton
					provider="facebook"
					onClick={() => {
						// * onError and onSuccess are optional. They're just here to show that they exist.
						// ! provider is also optional, but its use is highly recommended.
						oreIdFromContext.popup
							.auth({
								provider: AuthProvider.Facebook,
							})
							.then(onSuccess)
							.catch(onError);
					}}
				/>
				<LoginButton
					provider="google"
					onClick={() => {
						// * onError and onSuccess are optional. They're just here to show that they exist.
						// ! provider is also optional, but its use is highly recommended.
						oreIdFromContext.popup
							.auth({
								provider: AuthProvider.Google,
							})
							.then(onSuccess)
							.catch(onError);
					}}
				/>
				<LoginButton
					provider="email"
					onClick={() => {
						// * onError and onSuccess are optional. They're just here to show that they exist.
						// ! provider is also optional, but its use is highly recommended.
						oreIdFromContext.popup
							.auth({
								provider: AuthProvider.Email,
							})
							.then(onSuccess)
							.catch(onError);
					}}
				/>
			</div>
			{error && <div className="App-error">Error: {error.message}</div>}
		</>
	);
};

const LoggedInView: React.FC = () => {
	const oreIdFromContext = useOreId();
	const user = useUser();

	if (!user) return null;

	const { accountName, email, name, picture } = user;
	return (
		<>
			<div style={{ marginTop: 50 }}>
				<h4>User Info</h4>
				<img
					src={picture.toString()}
					style={{ width: 100, height: 100, paddingBottom: 30 }}
					alt={"user"}
				/>
				<br />
				OreId account: {accountName}
				<br />
				{name}
				<br />
				{email}
				<br />
				<br />
				<Button onClick={() => oreIdFromContext.logout()}>Logout</Button>
				<br />
			</div>
			<AtomicHub />
		</>
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
	}, []);

	if (!oreidReady) {
		return <>Loading...</>;
	}

	return (
		<OreidProvider oreId={oreId}>
			<AppWithProvider />
		</OreidProvider>
	);
};
