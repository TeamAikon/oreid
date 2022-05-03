import { ChainNetwork } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useEffect, useState } from "react";
import { AtomichubAssets, AtomichubOffer } from "./AtomicHubTypes";
import { BuyButtom } from "./BuyButtom";
import { DisplayAssets } from "./DisplayAssets";

const loadOffers = async ({
	collection,
}: {
	collection: string;
}): Promise<AtomichubOffer[]> => {
	const response = await fetch(
		`https://test.wax.api.atomicassets.io/atomicassets/v1/offers?collection_name=${collection}&page=1&limit=100&order=desc&sort=created`
	);
	const json = await response.json();
	return json?.data || [];
};

interface Props {}
export const AssetsToBuy: React.FC<Props> = () => {
	const [assets, setAssets] = useState<AtomichubAssets[]>([]);
	const oreId = useOreId();

	const account = oreId.auth.user.data.chainAccounts.find(
		(chainAccount) => chainAccount.chainNetwork === ChainNetwork.WaxTest
	);
	const waxAccount = account?.chainAccount || "";

	useEffect(() => {
		loadOffers({ collection: "orenetworkv1" }).then((offers) => {
			const assetsToSell = offers
				.filter((offer) => offer.sender_name !== waxAccount)
				.map((offer) => offer.sender_assets)
				.flat();
			setAssets(assetsToSell);
		});
	}, [setAssets, waxAccount]);

	if (assets.length === 0) return null;
	return (
		<>
			<h2>NFT to Buy</h2>
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
						footer={<BuyButtom asset={asset} />}
					/>
				))}
			</div>
			Total: {assets.length}
			<br />
			<br />
		</>
	);
};
