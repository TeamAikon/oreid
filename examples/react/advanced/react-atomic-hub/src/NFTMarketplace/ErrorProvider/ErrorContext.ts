import { createContext } from "react";

export const ErrorContext = createContext<{
	error: string | undefined;
	setError: (error: undefined | string | Error) => void;
}>({
	error: "",
	setError: () => undefined,
});
