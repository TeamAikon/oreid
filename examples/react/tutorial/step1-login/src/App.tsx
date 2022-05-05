import { AuthProvider, OreId, UserData } from "oreid-js";
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

interface OreidReactError {
	errors?: string | undefined;
	data?: any;
}
const NotLoggedInView: React.FC = () => {
	const oreIdFromContext = useOreId();
	const [errors, setErrors] = useState<OreidReactError | undefined>();

	const onError = (error: OreidReactError) => {
		console.log("Login failed", error);
		setErrors(error);
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
								params: { provider: AuthProvider.Facebook },
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
								params: { provider: AuthProvider.Google },
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
								params: { provider: AuthProvider.Email },
							})
							.then(onSuccess)
							.catch(onError);
					}}
				/>
			</div>
			{errors && <div className="App-error">Error: {errors.errors}</div>}
		</>
	);
};

const LoggedInView: React.FC = () => {
	const oreIdFromContext = useOreId();
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
			<button onClick={() => oreIdFromContext.logout()}>Logout</button>
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
