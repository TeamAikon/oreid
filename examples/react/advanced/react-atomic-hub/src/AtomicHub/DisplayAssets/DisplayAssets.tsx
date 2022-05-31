import React from "react";
import { AtomichubAssets } from "../AtomicHubTypes";
import { Card } from "../Card";
import { DisplayError } from "../ErrorProvider/DisplayError";
import { ErrorProvider } from "../ErrorProvider/ErrorProvider";

import style from "./DisplayAssets.module.scss";

interface Props {
	asset: AtomichubAssets;
	footer: JSX.Element;
}
export const DisplayAssets: React.FC<Props> = ({ asset, footer }) => {
	return (
		<ErrorProvider>
			<Card>
				<div className={style.DisplayAssets}>
					<img
						src={`https://boxycoinnfts.mypinata.cloud/ipfs/${asset.data.img}`}
						className={style.image}
						alt=""
					/>
					<div className={style.content}>
						{asset.data.name}
						<br />#{asset.asset_id}
						<br />
						{footer}
					</div>
				</div>
				<DisplayError />
			</Card>
		</ErrorProvider>
	);
};
