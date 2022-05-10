import { ChainNetwork } from "oreid-js";
import React, { useCallback, useEffect, useState } from "react";
import { AssetsToBuy } from "./AssetsToBuy";
import { AtomichubAssets } from "./AtomicHubTypes";
import { getAssetsFromCollection } from "./helpers/getAssetsFromCollection";
import { useUsercChainAccount } from "./hooks/useUsercChainAccount";
import { MyAssetsList } from "./MyAssetsList";
import { WaxBalance } from "./WaxBalance";

export const AtomicHub: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [assets, setAssets] = useState<AtomichubAssets[]>([]);

	const waxAccount = useUsercChainAccount({
		chainNetwork: ChainNetwork.WaxTest,
	});

	const loadMyAssets = useCallback(() => {
		setLoading(true);
		getAssetsFromCollection({
			waxAccount,
			collection: "orenetworkv1",
		})
			.then((myAssets) => {
				setAssets(myAssets);
			})
			.catch((error) => {
				setAssets([]);
				console.error(error);
			})
			.finally(() => setLoading(false));
	}, [waxAccount]);

	useEffect(() => {
		loadMyAssets();
	}, [loadMyAssets]);

	return (
		<>
			<WaxBalance />
			{loading ? (
				<>Loading my assets...</>
			) : (
				<>
					<MyAssetsList assets={assets} loadMyAssets={loadMyAssets} />
					<br />
					{assets.length > 0 && <AssetsToBuy />}
				</>
			)}
		</>
	);
};
