import { ChainNetwork } from "oreid-js";
import React, { useCallback, useEffect, useState } from "react";
import { AssetsToBuy } from "./AssetsToBuy";
import style from "./NFTMarketplace.module.scss";
import { NFTMarketplaceAssets } from "./NFTMarketplaceTypes";
import { getAssetsFromCollection } from "./helpers/getAssetsFromCollection";
import { useInterval } from "./hooks/useInterval";
import { useUsercChainAccount } from "./hooks/useUsercChainAccount";
import { MyAssetsList } from "./MyAssetsList";
import { WaxBalance } from "./WaxBalance";
import { isEqual } from "lodash";

export const NFTMarketplace: React.FC = () => {
	const [error, setError] = useState<Error | undefined>();
	const [loading, setLoading] = useState(true);
	const [assets, setAssets] = useState<NFTMarketplaceAssets[]>([]);

	const waxAccount = useUsercChainAccount({
		chainNetwork: ChainNetwork.WaxTest,
	});

	const loadMyAssets = useCallback(() => {
		const updateAssets = (update: NFTMarketplaceAssets[]) => {
			if (!isEqual(assets, update)) {
				setAssets(update);
			}
		};
		getAssetsFromCollection({
			waxAccount,
			collection: "orenetworkv1",
		})
			.then((myAssets) => {
				updateAssets(myAssets);
			})
			.catch((error) => {
				updateAssets([]);
				setError(error);
			})
			.finally(() => setLoading(false));
	}, [waxAccount, assets]);

	// first load
	useEffect(() => {
		loadMyAssets();
	}, [loadMyAssets]);
	useInterval(() => {
		loadMyAssets();
	}, 60000);

	return (
		<div className={style.NFTMarketplace}>
			<section className={style.welcome}>
				<h2>Welcome to ORE ID!</h2>
				<div className={style.balance}>
					<WaxBalance />
				</div>
			</section>

			{loading ? (
				<>Loading my assets...</>
			) : (
				<>
					{error && (
						<div className="App-error-nft-marketplace">
							Error: {error.message}
						</div>
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
