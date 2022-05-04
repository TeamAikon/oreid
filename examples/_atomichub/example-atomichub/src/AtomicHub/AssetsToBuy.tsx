import { ChainNetwork } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useEffect, useState } from "react";
import { AtomichubOffer } from "./AtomicHubTypes";
import { BuyButtom } from "./BuyButtom";
import { DisplayAssets } from "./DisplayAssets";
import { getOffersFromCollection } from "./helpers/getOffersFromCollection";

interface Props {}
export const AssetsToBuy: React.FC<Props> = () => {
	const [offers, setOffers] = useState<AtomichubOffer[]>([]);
	const oreId = useOreId();

	const account = oreId.auth.user.data.chainAccounts.find(
		(chainAccount) => chainAccount.chainNetwork === ChainNetwork.WaxTest
	);
	const waxAccount = account?.chainAccount || "";

	useEffect(() => {
		// TODO: Should use "/sales" endpoint
		getOffersFromCollection({ collection: "orenetworkv1" }).then(
			(marketOffers) => {
				const assetsToSell = marketOffers.filter(
					(offer) => offer.sender_name !== waxAccount
				);
				setOffers(assetsToSell);
			}
		);
	}, [setOffers, waxAccount]);

	if (offers.length === 0) return null;
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
				{offers
					.map((offer) => {
						return offer.sender_assets.map((asset) => (
							<DisplayAssets
								key={asset.asset_id}
								asset={asset}
								footer={<BuyButtom offer={offer} />}
							/>
						));
					})
					.flat()}
			</div>
			<br />
		</>
	);
};
