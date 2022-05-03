import React from "react";
import { AtomichubAssets } from "./AtomicHubTypes";
import { SellOrCancelButtom } from "./SellOrCancelButtom";

interface Props {
	assets: AtomichubAssets[];
}
export const ShowMyAssets: React.FC<Props> = ({ assets }) => {
	if (assets.length === 0) return null;
	return (
		<>
			<div
				style={{
					display: "flex",
					marginBottom: "25px",
					flexWrap: "wrap",
					justifyContent: "center",
				}}
			>
				{assets.map((asset) => (
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
						<br />
						<br />
						<img
							src={`https://resizer.atomichub.io/images/v1/preview?ipfs=${asset.data.img}&size=370`}
							style={{ maxWidth: "100%" }}
							alt=""
						/>
						<br />
						<SellOrCancelButtom asset={asset} />
					</div>
				))}
			</div>
			Total: {assets.length}
		</>
	);
};
