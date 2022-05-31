import React from "react";

import style from "./ButtonGradient.module.scss";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	icon?: string;
}

export const ButtonGradient: React.FC<Props> = ({
	children,
	className,
	icon,
	...props
}) => {
	return (
		<button {...props} className={`${style.ButtonGradient} ${className || ""}`}>
			{icon && <img className={style.MyButtonImage} src={icon} alt="" />}
			{children}
		</button>
	);
};
