import { ChainNetwork } from "oreid-js";
import React, { useCallback, useEffect, useState } from "react";
import { AssetsToBuy } from "./AssetsToBuy";
import { AtomichubAssets } from "./AtomicHubTypes";
import { getAssetsFromCollection } from "./helpers/getAssetsFromCollection";
import { useUsercChainAccount } from "./hooks/useUsercChainAccount";
import { MyAssetsList } from "./MyAssetsList";
import { WaxBalance } from "./WaxBalance";

export const AtomicHub: React.FC = () => {
	const [error, setError] = useState<Error | undefined>();
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
				setError(error);
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
					{error && (
						<div className="App-error-atomichub">Error: {error.message}</div>
					)}
					<MyAssetsList assets={assets} loadMyAssets={loadMyAssets} />
					<br />
					{assets.length > 0 && <AssetsToBuy />}
				</>
			)}
		</>
	);
};
