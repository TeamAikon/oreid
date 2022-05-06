import { ChainNetwork } from "oreid-js";
import React, { useState } from "react";
import { AtomichubSale } from "./AtomicHubTypes";
import { BuyButtom } from "./BuyButtom";
import { DisplayAssets } from "./DisplayAssets";
import { getSalesFromCollection } from "./helpers/getSalesFromCollection";
import { useUsercChainAccount } from "./hooks/useUsercChainAccount";

interface Props {}
export const AssetsToBuy: React.FC<Props> = () => {
	const [loading, setLoading] = useState(false);
	const [sales, setSales] = useState<AtomichubSale[]>([]);
	const waxAccount = useUsercChainAccount({
		chainNetwork: ChainNetwork.WaxTest,
	});

	console.log({ sales });

	if (sales.length === 0)
		return (
			<button
				disabled={loading}
				onClick={() => {
					setLoading(true);
					getSalesFromCollection({ collection: "orenetworkv1" }).then(
						(marketSales) => {
							const salesList = marketSales.filter(
								(sale) => sale.seller !== waxAccount
							);
							setSales(salesList);
						}
					);
				}}
			>
				{loading ? "Loading..." : "Load listed tokens"}
			</button>
		);
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
				{sales
					.map((sale) => {
						return sale.assets.map((asset) => (
							<DisplayAssets
								key={asset.asset_id}
								asset={asset}
								footer={<BuyButtom sale={sale} />}
							/>
						));
					})
					.flat()}
			</div>
			<br />
		</>
	);
};
