import React, { useCallback, useState } from "react";
import { ErrorContext } from "./ErrorContext";

interface Props {}
export const ErrorProvider: React.FC<Props> = ({ children }) => {
	const [error, setErrorContext] = useState<string | undefined>(undefined);

	const setError = useCallback(
		(newErro: string | undefined | Error) => {
			if (typeof newErro === "object") {
				setErrorContext(newErro.message);
				return;
			}
			setErrorContext(newErro);
		},
		[setErrorContext]
	);

	return (
		<ErrorContext.Provider
			value={{
				error,
				setError,
			}}
		>
			{children}
		</ErrorContext.Provider>
	);
};
