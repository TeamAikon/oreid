import { OreId } from "oreid-js";
import { OreidProvider } from "oreid-react";
import { createOreIdWebWidget, OreIdWebWidget } from "oreid-webwidget";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AppProvider } from "./AppProvider";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

const oreId = new OreId({
	appName: "ORE ID Sample App",
	appId: process.env.REACT_APP_OREID_APP_ID || "",
	apiKey: process.env.REACT_APP_OREID_API_KEY || ""
});

let webWidget: OreIdWebWidget;

createOreIdWebWidget(oreId, window).then(oreIdWebWidget => {
	webWidget = oreIdWebWidget
	renderApp()
})


const renderApp = () => {
	ReactDOM.render(
		<React.StrictMode>
			<AppProvider>
			<OreidProvider oreId={oreId} webWidget={webWidget}>
				<App />
			</OreidProvider>
			</AppProvider>
		</React.StrictMode>,
		document.getElementById("root")
	);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
