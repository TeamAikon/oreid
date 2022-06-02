import { ChainNetwork } from "oreid-js";
import React, { useCallback, useEffect, useState } from "react";
import { AssetsToBuy } from "./AssetsToBuy";
import styles from "./AtomicHub.module.scss";
import { AtomicHubAssets } from "./AtomicHubTypes";
import { getAssetsFromCollection } from "./helpers/getAssetsFromCollection";
import { useInterval } from "./hooks/useInterval";
import { useUsercChainAccount } from "./hooks/useUsercChainAccount";
import { MyAssetsList } from "./MyAssetsList";
import { WaxBalance } from "./WaxBalance";
import { isEqual } from "lodash";
import { AcordeonBox } from "./AcordeonBox";
import { Instructions } from "./Instructions";

export const AtomicHub: React.FC = () => {
	const [error, setError] = useState<Error | undefined>();
	const [loading, setLoading] = useState(true);
	const [assets, setAssets] = useState<AtomicHubAssets[]>([]);

	const waxAccount = useUsercChainAccount({
		chainNetwork: ChainNetwork.WaxTest,
	});

	const loadMyAssets = useCallback(() => {
		const updateAssets = (update: AtomicHubAssets[]) => {
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
		<div className={styles.AtomicHub}>
			<section className={styles.welcome}>
				<div className={styles.welcomeTitle}>
					<h2>Welcome to ORE ID!</h2>
					<div className={styles.balance}>
						<WaxBalance />
					</div>
				</div>

				<div className={styles.instructions}>
					<AcordeonBox title="Play by Play">
						<Instructions />
					</AcordeonBox>
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
