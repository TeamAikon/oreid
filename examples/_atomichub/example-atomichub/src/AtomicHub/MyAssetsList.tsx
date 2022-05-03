import React from "react";
import { AtomichubAssets } from "./AtomicHubTypes";
import { DisplayAssets } from "./DisplayAssets";
import { SellOrCancelButtom } from "./SellOrCancelButtom";

interface Props {
	assets: AtomichubAssets[];
}
export const MyAssetsList: React.FC<Props> = ({ assets }) => {
	if (assets.length === 0) return null;
	return (
		<>
			<h2>My NFTs</h2>
			<div
				style={{
					display: "flex",
					marginBottom: "25px",
					flexWrap: "wrap",
					justifyContent: "center",
				}}
			>
				{assets.map((asset) => (
					<DisplayAssets
						key={asset.asset_id}
						asset={asset}
						footer={<SellOrCancelButtom asset={asset} />}
					/>
				))}
			</div>
			Total: {assets.length}
			<br />
			<br />
		</>
	);
};
