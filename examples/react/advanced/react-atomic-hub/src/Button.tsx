import React from "react";
import "./Button.css";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	icon?: string;
}

export const Button: React.FC<Props> = ({
	icon,
	children,
	className,
	...props
}) => {
	return (
		<button className={`MyButton ${className || ""}`} {...props}>
			{icon && <img className="MyButtonImage" src={icon} alt="" />}
			{children}
		</button>
	);
};
