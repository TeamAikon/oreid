import { AuthProvider, OreId, UserData } from "oreid-js";
import LoginButton from "oreid-login-button";
// ! To use hooks from oreid-react make sure you added the OreidProvider (index.tx shows how to do this)
import { OreidProvider, useIsLoggedIn, useOreId, useUser } from "oreid-react";
import { WebPopup } from "oreid-webpopup";
import React, { useEffect, useState } from "react";
import "./App.css";
import { AtomicHub } from "./AtomicHub";
import { Header } from "./Header";

const REACT_APP_OREID_APP_ID = "t_4683afc074ab444ebdf1bf08ed8d1757";

// * Initialize OreId
const oreId = new OreId({
	appName: "ORE ID Sample App",
	appId: REACT_APP_OREID_APP_ID,
	oreIdUrl: "https://staging.service.oreid.io",
	plugins: {
		popup: WebPopup(),
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

	const loginWithOreId = (provider: AuthProvider) => {
		oreIdFromContext.popup
			.auth({
				provider,
			})
			.then(onSuccess)
			.catch(onError);
	};

	return (
		<div
			style={{ display: "flex", alignItems: "center", flexDirection: "column" }}
		>
			<LoginButton
				provider="facebook"
				onClick={() => {
					loginWithOreId(AuthProvider.Facebook);
				}}
			/>
			<LoginButton
				provider="google"
				onClick={() => {
					loginWithOreId(AuthProvider.Google);
				}}
			/>
			<LoginButton
				provider="email"
				onClick={() => {
					loginWithOreId(AuthProvider.Email);
				}}
			/>
			{error && <div className="App-error">Error: {error.message}</div>}
		</div>
	);
};

const LoggedInView: React.FC = () => {
	const user = useUser();
	if (!user) return null;
	return <AtomicHub />;
};

const AppWithProvider: React.FC = () => {
	const isLoggedIn = useIsLoggedIn();
	return (
		<div className="App">
			<Header />
			{isLoggedIn ? <LoggedInView /> : <NotLoggedInView />}
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
