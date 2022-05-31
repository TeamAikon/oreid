import React from "react";
import { ReactComponent as Logo } from "./logo.svg";
import { OreIdProfileButton } from "oreid-profile";

import style from "./Header.module.scss";
import { useOreId } from "oreid-react";

export const Header: React.FC = () => {
	const oreId = useOreId();
	return (
		<header className={style.Header}>
			<div className={style.content}>
				<a href="https://developer.oreid.io/">
					<Logo />
				</a>
				<div>
					<OreIdProfileButton
						align="right"
						//@ts-ignore
						oreId={oreId}
						style={{
							backgroundColor: "#2A3566",
							linkColor: "#3A9FFF",
							textColor: "#fff",
						}}
					/>
				</div>
			</div>
		</header>
	);
};
