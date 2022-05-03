import React, { useCallback, useState } from "react";
import { AtomichubAssets } from "./AtomicHubTypes";

interface Props {
	asset: AtomichubAssets;
}

export const SellOrCancelButtom: React.FC<Props> = ({ asset }) => {
	const [isLoading, setIsLoading] = useState(false);

	// TODO: How to check if my nft is on sale or not?
	const onSale = true;

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
