import React from "react";
import LogoFooter from "./logo-oreid.svg";

import styles from "./Footer.module.scss";

export const Footer: React.FC = () => {
	return (
		<div className={styles.Footer}>
			<img className={styles.img} src={LogoFooter} alt="" />
		</div>
	);
};
