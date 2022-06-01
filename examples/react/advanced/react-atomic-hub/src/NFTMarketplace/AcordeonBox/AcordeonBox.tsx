import React from "react";
import styles from "./AcordeonBox.module.scss";
import { AcordeonItem } from "./AcordeonItem";
import { Acordeon } from "./AcordeonTypes";

interface Props {
	items: Acordeon[];
}

export const AcordeonBox: React.FC<Props> = ({ items }) => {
	return (
		<div className={styles.AcordeonBox}>
			{items.map((item, key) => (
				<AcordeonItem item={item} key={key} />
			))}
		</div>
	);
};
