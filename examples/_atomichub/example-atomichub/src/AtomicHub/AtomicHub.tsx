import React, { useState } from "react";
import { AtomichubAssets } from "./AtomicHubTypes";
import { GetMyWelcomeNFT } from "./GetMyWelcomeNFT";
import { LoadMyAssets } from "./LoadMyAssets";
import { ShowMyAssets } from "./ShowMyAssets";

export const AtomicHub: React.FC = () => {
	const [assets, setAssets] = useState<AtomichubAssets[]>([]);

	return (
		<>
			<h2>Atomic Hub</h2>
			<GetMyWelcomeNFT />
			<br />
			<LoadMyAssets setAssets={setAssets} />
			<ShowMyAssets assets={assets} />
		</>
	);
};
