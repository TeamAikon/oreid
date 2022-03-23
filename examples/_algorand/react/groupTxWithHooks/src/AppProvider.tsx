import { OreId } from "oreid-js";
import { createOreIdWebWidget, OreIdWebWidget } from "oreid-webwidget";
import { OreidProvider } from "oreid-react";
import React, { useEffect } from "react";
import { useState, createContext } from "react";

const oreId = new OreId({
	appName: "ORE ID Sample App",
	appId: process.env.REACT_APP_OREID_APP_ID || "",
	apiKey: process.env.REACT_APP_OREID_API_KEY || "",
	oreIdUrl: process.env.REACT_APP_OREID_URL,
});

export const AppContext = createContext<{
	errors: string | undefined;
	setErrors: (errors: string | undefined) => void;
	oreIdResult: string | undefined;
	setOreIdResult: (oreIdResult: string | undefined) => void;
	toAddress: string;
	setToAddress: (toAddress: string) => void;
}>({
	errors: undefined,
	setErrors: () => undefined,
	oreIdResult: undefined,
	setOreIdResult: () => undefined,
	toAddress: "",
	setToAddress: () => undefined,
});

interface Props {}
export const AppProvider: React.FC<Props> = ({ children }) => {
	const [webWidget, setWebWidget] = useState<OreIdWebWidget | undefined>();
	const [errors, setErrors] = useState<string | undefined>(undefined);
	const [oreIdResult, setOreIdResult] = useState<string | undefined>(undefined);
	const [toAddress, setToAddress] = useState(
		"VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ"
	);

	useEffect(() => {
		createOreIdWebWidget(oreId, window).then((widget) => {
			setWebWidget(widget);
		});
	}, []);

	if (!webWidget) return <>Loading...</>;
	return (
		<OreidProvider oreId={oreId} webWidget={webWidget}>
			<AppContext.Provider
				value={{
					errors,
					setErrors,
					oreIdResult,
					setOreIdResult,
					toAddress,
					setToAddress,
				}}
			>
				{children}
			</AppContext.Provider>
		</OreidProvider>
	);
};
