/* eslint-disable react-hooks/exhaustive-deps */
import { truncate } from "../Helpers";
import React, { useEffect, useRef } from "react";
import { prepEllipse } from "../Helpers";
import styles from "./TruncateStart.module.scss";

export const TruncateStart: React.FC = ({ children }) => {
	const measuredParent = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const myEffect = () => {
			if (!measuredParent.current) {
				return;
			}
			prepEllipse(measuredParent.current, truncate.removeEnd);
		};

		window.addEventListener("resize", myEffect);
		return () => {
			window.removeEventListener("resize", myEffect);
		};
	}, []);

	return (
		<div ref={measuredParent} className={styles.TruncateStart}>
			{children}
		</div>
	);
};
