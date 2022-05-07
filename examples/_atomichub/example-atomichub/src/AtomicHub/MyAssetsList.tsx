import { ChainNetwork } from "oreid-js";
import React, { useCallback, useEffect, useState } from "react";
import { AtomichubAssets } from "./AtomicHubTypes";
import { ClaimMyToken } from "./ClaimMyToken";
import { DisplayAssets } from "./DisplayAssets";
import { getAssetsFromCollection } from "./helpers/getAssetsFromCollection";
import { useUsercChainAccount } from "./hooks/useUsercChainAccount";
import { SellOrCancelButtom } from "./SellOrCancelButtom";

interface Props {}
export const MyAssetsList: React.FC<Props> = () => {
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

	const title = <h2>My NFTs on Atomic Hub</h2>;

	if (loading)
		return (
			<>
				{title}
				<br />
				Loading my assets...
			</>
		);
	if (assets.length === 0)
		return (
			<>
				{title}
				<ClaimMyToken loadMyAssets={loadMyAssets} />
			</>
		);
	return (
		<>
			{title}
			<div
				style={{
					display: "flex",
					marginBottom: "25px",
					flexWrap: "wrap",
					justifyContent: "center",
				}}
			>
				{assets.map((asset) => (
					<DisplayAssets
						key={asset.asset_id}
						asset={asset}
						footer={<SellOrCancelButtom asset={asset} />}
					/>
				))}
			</div>
			Total: {assets.length}
			<br />
			<br />
		</>
	);
};
