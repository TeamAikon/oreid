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
				// points to proxy (see server.js) - don't use https:// prefix or we will get a CORS error
				src={`/resizer.atomichub.io/images/v1/preview?ipfs=${asset.data.img}&size=370`}
				style={{ maxWidth: "100%", margin: "15px 0px" }}
				alt=""
			/>
			<div style={{ marginBottom: "15px" }}>{footer}</div>
		</div>
	);
};
