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
				<Logo />
				<div>
					<OreIdProfileButton
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
