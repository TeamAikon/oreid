import React from "react";
import { AssetsToBuy } from "./AssetsToBuy";
import { MyAssetsList } from "./MyAssetsList";

export const AtomicHub: React.FC = () => {
	return (
		<>
			<h2>Atomic Hub</h2>
			<MyAssetsList />
			<br />
			<AssetsToBuy />
		</>
	);
};
