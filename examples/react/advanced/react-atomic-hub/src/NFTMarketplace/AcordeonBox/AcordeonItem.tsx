import classNames from "classnames";
import React, { useState } from "react";
import styles from "./AcordeonItem.module.scss";
import { Acordeon } from "./AcordeonTypes";
import Arrow from "./arrow.svg";

interface Props {
	item: Acordeon;
}

export const AcordeonItem: React.FC<Props> = ({ item }) => {
	const [open, setOpen] = useState(false);
	return (
		<div className={classNames(styles.AcordeonItem, { [styles.open]: open })}>
			<div className={styles.label} onClick={() => setOpen(!open)}>
				<div className={styles.text}>{item.label}</div>
				<img src={Arrow} className={styles.arrow} alt="" />
			</div>
			<div className={styles.content}>{item.content}</div>
		</div>
	);
};
