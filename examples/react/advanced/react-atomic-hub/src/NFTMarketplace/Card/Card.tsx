import classNames from "classnames";
import React from "react";
import style from "./Card.module.scss";

interface Props {
	className?: string;
}
export const Card: React.FC<Props> = ({ children, className }) => {
	return <div className={classNames(style.Card, className)}>{children}</div>;
};
