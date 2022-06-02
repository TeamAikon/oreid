import classNames from "classnames";
import React, { CSSProperties, FunctionComponent, useMemo } from "react";
import { CopyToClipboard } from "../CopyToClipboard";
import { TruncateEnd } from "../TruncateEnd";
import { TruncateMiddle } from "../TruncateMiddle";
import { TruncateStart } from "../TruncateStart";
import styles from "./LongText.module.scss";

interface LongTextProps {
	text: string;

	className?: string;
	style?: CSSProperties | undefined;

	truncate: "start" | "middle" | "end";
	onClick?: () => void;
	copy?: {
		position: "start" | "end";
		icon: JSX.Element;
		onCopy?: () => void;
	};
}

export const LongText: FunctionComponent<LongTextProps> = ({
	text,
	className,
	style,
	truncate,
	onClick,
	copy,
}) => {
	const content = useMemo(() => {
		if (truncate === "start") {
			return (
				<TruncateStart>
					<span onClick={onClick}>{text}</span>
				</TruncateStart>
			);
		}
		if (truncate === "middle") {
			return (
				<TruncateMiddle>
					<span onClick={onClick}>{text}</span>
				</TruncateMiddle>
			);
		}
		return (
			<TruncateEnd>
				<span onClick={onClick}>{text}</span>
			</TruncateEnd>
		);
	}, [truncate, text]);

	const copyComponent = useMemo(() => {
		if (!copy) return <></>;
		return (
			<div
				className={classNames(styles.copy, {
					[styles.start]: copy.position === "start",
				})}
				onClick={(e) => e.stopPropagation()}
			>
				<CopyToClipboard text={text} {...copy} />
			</div>
		);
	}, [text, copy]);

	return (
		<div className={classNames(styles.LongText, className)} style={style}>
			{copy && copy.position === "start" && copyComponent}
			<div className={styles.container} style={style}>
				{content}
			</div>
			{copy && copy.position === "end" && copyComponent}
		</div>
	);
};
