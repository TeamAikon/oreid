import React, { useState } from "react";
import styles from "./AcordeonBox.module.scss";
import Arrow from "./arrow.svg";
import classNames from "classnames";

interface Props {
	title: string | JSX.Element;
}

export const AcordeonBox: React.FC<Props> = ({ title, children }) => {
	const [open, setOpen] = useState(false);

	return (
		<div className={classNames(styles.AcordeonBox, { [styles.open]: open })}>
			<h1 onClick={() => setOpen(!open)}>
				<span>{title}</span> <img src={Arrow} className={styles.arrow} alt="" />
			</h1>
			{open ? children : null}
		</div>
	);
};
