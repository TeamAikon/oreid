import React, { useContext } from "react";
import { ErrorContext } from "./ErrorContext";

import styles from "./DisplayError.module.scss";

interface Props {}
export const DisplayError: React.FC<Props> = () => {
	const { error } = useContext(ErrorContext);
	if (!error) return null;
	const display = error.length >= 58 ? error.substring(0, 58) + "..." : error;
	return <div className={styles.DisplayError}>Error: {display}</div>;
};
