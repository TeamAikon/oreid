import React, { useCallback, useEffect, useState } from "react";
import { AtomichubAssets } from "./AtomicHubTypes";

interface Props {
	asset: AtomichubAssets;
}

const isAssetOnSale = async (asset: AtomichubAssets) => {
	const response = await fetch(
		`https://test.wax.api.atomicassets.io/atomicassets/v1/offers?asset_id=${asset.asset_id}&page=1&limit=100&order=desc&sort=created`
	);
	const json = await response.json();
	const offers = json?.data || [];
	return offers.length >= 1;
};

export const SellOrCancelButtom: React.FC<Props> = ({ asset }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [onSale, setOnSale] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		isAssetOnSale(asset)
			.then((isOnSale) => setOnSale(isOnSale))
			.finally(() => setIsLoading(false));
	}, [asset]);

	const offerAsset = useCallback(async () => {
		// TODO: Create transaction to sell my NFT
		console.log("Offer my NFT for sale");
	}, [asset]);
	const cancelAssetOffer = useCallback(async () => {
		// TODO: Create transaction to cancel my NFT offer
		console.log("Cancel sales offer");
	}, [asset]);

	if (!asset.is_transferable) return null;

	const onClick = () => {
		setIsLoading(true);

		if (onSale) {
			cancelAssetOffer()
				.then(() => {
					// Do something
				})
				.catch(console.error)
				.finally(() => setIsLoading(false));
			return;
		}

		offerAsset()
			.then(() => {
				// Do something
			})
			.catch(console.error)
			.finally(() => setIsLoading(false));
	};

	if (isLoading) return <>Loading...</>;
	return (
		<button onClick={onClick}>{onSale ? "Cancel offer" : "Sell my NFT"}</button>
	);
};
