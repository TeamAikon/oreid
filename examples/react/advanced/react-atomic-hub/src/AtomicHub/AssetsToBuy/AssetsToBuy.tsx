import { ChainNetwork } from "oreid-js";
import React, { useState } from "react";
import { AtomichubSale } from "../AtomicHubTypes";
import { BuyButtom } from "../BuyButtom";
import { DisplayAssets } from "../DisplayAssets";
import { getSalesFromCollection } from "../helpers/getSalesFromCollection";
import { useUsercChainAccount } from "../hooks/useUsercChainAccount";
import { ButtonGradient } from "../ButtonGradient";

import styles from "./AssetsToBuy.module.scss";

interface Props {}
export const AssetsToBuy: React.FC<Props> = () => {
	const [loading, setLoading] = useState(false);
	const [sales, setSales] = useState<AtomichubSale[]>([]);
	const [nothingForSale, setNothingForSale] = useState(false);
	const waxAccount = useUsercChainAccount({
		chainNetwork: ChainNetwork.WaxTest,
	});

	let body: JSX.Element;

	if (sales.length === 0) {
		let label = "";
		if (loading) {
			label = "Loading...";
		} else if (nothingForSale) {
			label = "Nothing for sale";
		} else {
			label = "Load listed tokens";
		}

		body = (
			<ButtonGradient
				disabled={loading}
				icon="/img/atomic-hub-logo.svg"
				onClick={() => {
					setLoading(true);
					getSalesFromCollection({ collection: "orenetworkv1" })
						.then((marketSales) => {
							const salesList = marketSales.filter(
								(sale) => sale.seller !== waxAccount
							);
							setSales(salesList);
							if (salesList.length === 0) setNothingForSale(true);
							setLoading(false);
						})
						.catch((error) => {
							console.log(error);
						});
				}}
			>
				{label}
			</ButtonGradient>
		);
	} else {
		body = (
			<div className={styles.list}>
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
		<div className={styles.AssetsToBuy}>
			<h2>NFTs to Buy on Atomic Hub</h2>
			{body}
			<br />
		</div>
	);
};
