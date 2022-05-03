import React from "react";
import { AtomichubAssets } from "./AtomicHubTypes";

interface Props {
	asset: AtomichubAssets;
	footer: JSX.Element;
}
export const DisplayAssets: React.FC<Props> = ({ asset, footer }) => {
	return (
		<div
			key={asset.asset_id}
			style={{
				width: "300px",
				padding: "10px",
				border: "1px solid #fff",
				margin: "20px",
			}}
		>
			{asset.data.name}
			<br />#{asset.asset_id}
			<br />
			<img
				src={`https://resizer.atomichub.io/images/v1/preview?ipfs=${asset.data.img}&size=370`}
				style={{ maxWidth: "100%" }}
				alt=""
			/>
			<br />
			{footer}
		</div>
	);
};
