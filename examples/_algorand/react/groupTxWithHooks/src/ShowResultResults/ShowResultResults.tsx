import React from "react";

interface Props {
	result?: string;
	error?: boolean;
}
export const ShowResultResults: React.FC<Props> = ({
	result,
	error = false,
}) => {
	if (!result) return null;
	return <div className={!error ? "App-success" : "App-error"}>{result}</div>;
};
