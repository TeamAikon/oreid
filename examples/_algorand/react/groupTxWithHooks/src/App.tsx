import { useIsLoggedIn } from "oreid-react";
import React, { useContext } from "react";
import "./App.css";
import { AppContext } from "./AppProvider";
import { LoggedIn } from "./LoggedIn";
import { LoggedOut } from "./LoggedOut";
import { ShowResultResults } from "./ShowResultResults";

function App() {
	const isLoggedIn = useIsLoggedIn();
	const { errors, oreIdResult } = useContext(AppContext);

	return (
		<div className="App">
			<header className="App-header">
				{isLoggedIn ? <LoggedIn /> : <LoggedOut />}
				<ShowResultResults result={oreIdResult} />
				<ShowResultResults result={errors} error />
			</header>
		</div>
	);
}

export default App;
