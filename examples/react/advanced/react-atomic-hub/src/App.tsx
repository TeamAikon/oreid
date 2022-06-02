import { OreId } from "oreid-js";
import { OreidProvider, useIsLoggedIn, useUser } from "oreid-react";
import { WebPopup } from "oreid-webpopup";
import React, { useEffect, useState } from "react";
import "./App.css";
import { AtomicHub } from "./AtomicHub";
import { Header } from "./Header";
import { LoginPage } from "./LoginPage";

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
			{isLoggedIn ? <LoggedInView /> : <LoginPage />}
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
