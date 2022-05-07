import React from "react";
import { AssetsToBuy } from "./AssetsToBuy";
import { MyAssetsList } from "./MyAssetsList";
import { WaxBalance } from "./WaxBalance";

export const AtomicHub: React.FC = () => {
	return (
		<>
			<WaxBalance />
			<MyAssetsList />
			<br />
			<AssetsToBuy />
		</>
	);
};
