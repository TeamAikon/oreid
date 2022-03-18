import React from "react";
import { useState, createContext } from "react";

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
	const [errors, setErrors] = useState<string | undefined>(undefined);
	const [oreIdResult, setOreIdResult] = useState<string | undefined>(undefined);
	const [toAddress, setToAddress] = useState(
		"VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ"
	);

	return (
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
	);
};
