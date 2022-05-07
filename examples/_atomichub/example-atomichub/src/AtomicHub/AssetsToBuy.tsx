import { ChainNetwork } from "oreid-js";
import React, { useState } from "react";
import { AtomichubSale } from "./AtomicHubTypes";
import { Button } from "../Button";
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

	let body: JSX.Element;

	if (sales.length === 0) {
		body = (
			<Button
				disabled={loading}
				icon="/img/atomic-hub-logo.svg"
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
			</Button>
		);
	} else {
		body = (
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
		);
	}
	return (
		<>
			<h2>NFTs to Buy on Atomic Hub</h2>
			{body}
			<br />
		</>
	);
};
