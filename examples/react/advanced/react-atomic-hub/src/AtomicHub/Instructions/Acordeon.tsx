import classNames from "classnames";
import React from "react";
import styles from "./Acordeon.module.scss";
import Arrow from "./arrow.svg";

interface Props {
	title: string;
	open: boolean;
	setOpen: (open: boolean) => void;
}

export const Acordeon: React.FC<Props> = ({
	title,
	children,
	open,
	setOpen,
}) => {
	return (
		<div className={classNames(styles.Acordeon, { [styles.open]: open })}>
			<h1 onClick={() => setOpen(!open)}>
				<span>{title}</span> <img src={Arrow} className={styles.arrow} alt="" />
			</h1>
			{open && <div className={styles.content}>{children}</div>}
		</div>
	);
};
