import React, { useState } from "react";
import { AssetsToBuy } from "./AssetsToBuy";
import { AtomichubAssets } from "./AtomicHubTypes";
import { GetMyWelcomeNFT } from "./GetMyWelcomeNFT";
import { LoadMyAssets } from "./LoadMyAssets";
import { MyAssetsList } from "./MyAssetsList";

export const AtomicHub: React.FC = () => {
	const [assets, setAssets] = useState<AtomichubAssets[]>([]);

	return (
		<>
			<h2>Atomic Hub</h2>
			<GetMyWelcomeNFT />
			<br />
			<LoadMyAssets setAssets={setAssets} />
			<MyAssetsList assets={assets} />
			<AssetsToBuy />
		</>
	);
};
