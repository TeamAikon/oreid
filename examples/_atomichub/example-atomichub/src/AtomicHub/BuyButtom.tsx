import React, { useCallback, useState } from "react";
import { AtomichubAssets } from "./AtomicHubTypes";

interface Props {
	asset: AtomichubAssets;
}

export const BuyButtom: React.FC<Props> = ({ asset }) => {
	const [isLoading, setIsLoading] = useState(false);

	const buyAsset = useCallback(async () => {
		// TODO: Create transaction to buy an NFT
		console.log("Offer my NFT for sale");
	}, [asset]);

	const onClick = () => {
		setIsLoading(true);
		buyAsset()
			.then(() => {
				// Do something
			})
			.catch(console.error)
			.finally(() => setIsLoading(false));
	};

	if (isLoading) return <>Loading...</>;
	return <button onClick={onClick}>Buy: {asset.data.name}</button>;
};
