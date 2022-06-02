import { ChainNetwork } from "oreid-js";
import React, { useCallback, useEffect, useState } from "react";
import { AssetsToBuy } from "./AssetsToBuy";
import style from "./AtomicHub.module.scss";
import { AtomicHubAssets } from "./AtomicHubTypes";
import { getAssetsFromCollection } from "./helpers/getAssetsFromCollection";
import { useInterval } from "./hooks/useInterval";
import { useUsercChainAccount } from "./hooks/useUsercChainAccount";
import { MyAssetsList } from "./MyAssetsList";
import { WaxBalance } from "./WaxBalance";
import { isEqual } from "lodash";
import { AcordeonBox } from "./AcordeonBox";

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
		<div className={style.AtomicHub}>
			<section className={style.welcome}>
				<div className={style.welcomeTitle}>
					<h2>Welcome to ORE ID!</h2>
					<div className={style.balance}>
						<WaxBalance />
					</div>
				</div>

				<AcordeonBox
					items={[
						{
							label: "Play by Play",
							content: "MY STEPS HERE",
						},
						// {
						// 	label:
						// 		"Mauris at eleifend quam. Aliquam facilisis dictum aliquet.",
						// 	content:
						// 		"Vivamus eleifend magna rutrum nisi venenatis, a ornare metus hendrerit. Mauris sapien sapien, posuere id euismod eget, porta vel tortor. Nunc dolor enim, tempus id accumsan vitae, finibus nec nisl. Quisque eu felis eu lectus blandit sagittis ut rutrum dolor.",
						// },
						// {
						// 	label:
						// 		"Donec nibh sem, rhoncus sit amet commodo at, tempus et lectus.",
						// 	content:
						// 		"In augue lectus, ornare in justo non, finibus elementum elit. Aliquam sagittis malesuada massa in tempus. Cras a metus id dui rhoncus tempor. Cras faucibus lacus non libero ultrices, vitae dictum tortor eleifend. Sed consectetur est id consectetur congue. Nam et aliquam metus.",
						// },
						// {
						// 	label:
						// 		"Ut vel commodo purus, vel posuere turpis. Donec maximus metus velit",
						// 	content:
						// 		"Morbi quis massa feugiat, tristique sapien et, egestas velit. Nulla dapibus tristique enim. Praesent luctus augue vitae malesuada gravida. Vivamus egestas eu odio a dapibus. Aliquam consequat, massa vitae mattis mattis, augue nisl varius nulla, sit amet venenatis orci urna ut nisi. Phasellus sollicitudin vel turpis vel accumsan. Aenean et maximus nibh, vitae hendrerit lectus.",
						// },
					]}
				/>
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
