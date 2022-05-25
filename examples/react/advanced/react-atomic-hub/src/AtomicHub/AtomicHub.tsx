import { ChainNetwork } from "oreid-js";
import React, { useCallback, useEffect, useState } from "react";
import { AssetsToBuy } from "./AssetsToBuy";
import style from "./AtomicHub.module.scss";
import { AtomichubAssets } from "./AtomicHubTypes";
import { getAssetsFromCollection } from "./helpers/getAssetsFromCollection";
import { useInterval } from "./hooks/useInterval";
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

	// first load
	useEffect(() => {
		loadMyAssets();
	}, [loadMyAssets]);
	useInterval(() => {
		loadMyAssets();
	}, 60000);

	return (
		<div className={style.AtomicHub}>
			<section className={style.welcome}>
				<h2>Welcome to ORE ID!</h2>
				<WaxBalance />
			</section>

			{loading ? (
				<>Loading my assets...</>
			) : (
				<>
					{error && (
						<div className="App-error-atomichub">Error: {error.message}</div>
					)}
					<section>
						<MyAssetsList
							account={waxAccount}
							assets={assets}
							loadMyAssets={loadMyAssets}
						/>
					</section>
					<section>
						<AssetsToBuy />
					</section>
				</>
			)}
		</div>
	);
};
