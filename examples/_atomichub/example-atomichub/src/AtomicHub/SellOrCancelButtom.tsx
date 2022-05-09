import { ChainNetwork } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../Button";
import { AtomichubAssets, AtomichubSale } from "./AtomicHubTypes";
import { cancelOreIdSaleTransaction } from "./helpers/cancelOreIdSaleTransaction";
import { createOreIdSaleTransaction } from "./helpers/createOreIdSaleTransaction";
import { getAssetSale } from "./helpers/getAssetSale";

interface Props {
	asset: AtomichubAssets;
}

export const SellOrCancelButtom: React.FC<Props> = ({ asset }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [sale, setSale] = useState<AtomichubSale | undefined>();
	const [transactionId, setTransactionId] = useState("");
	const oreId = useOreId();

	useEffect(() => {
		setIsLoading(true);
		getAssetSale(asset.asset_id)
			.then((assetSale) => setSale(assetSale))
			.finally(() => setIsLoading(false));
	}, [asset]);

	const createAssetSale = useCallback(async () => {
		setIsLoading(true);
		createOreIdSaleTransaction({
			oreId,
			chainNetwork: ChainNetwork.WaxTest,
			assets: [asset],
		})
			.then((transaction) => {
				oreId.popup
					.sign({ transaction })
					.then((result) => {
						setTransactionId(result?.transactionId || "");
					})
					.catch(console.error)
					.finally(() => setIsLoading(false));
			})
			.catch((error) => {
				console.error(error);
				setIsLoading(false);
			});
	}, [asset, oreId]);

	const cancelAssetSale = useCallback(async () => {
		if (!sale) return;
		setIsLoading(true);
		cancelOreIdSaleTransaction({
			sale,
			oreId,
			chainNetwork: ChainNetwork.WaxTest,
		})
			.then((transaction) => {
				oreId.popup
					.sign({ transaction })
					.then((result) => {
						setTransactionId(result?.transactionId || "");
					})
					.catch(console.error)
					.finally(() => setIsLoading(false));
			})
			.catch((error) => {
				console.error(error);
				setIsLoading(false);
			});
	}, [oreId, sale]);

	if (!asset.is_transferable) return null;

	const onClick = () => {
		setIsLoading(true);

		if (sale) {
			cancelAssetSale()
				.then(() => {
					// Do something
				})
				.catch(console.error)
				.finally(() => setIsLoading(false));
			return;
		}

		createAssetSale()
			.then(() => {
				// Do something
			})
			.catch(console.error)
			.finally(() => setIsLoading(false));
	};

	if (isLoading) return <>Loading...</>;
	if (transactionId) {
		return (
			<a
				style={{ color: "#fff" }}
				href={`https://wax-test.bloks.io/transaction/${transactionId}`}
				target="_blank"
				rel="noreferrer"
			>
				View on block explorer
			</a>
		);
	}
	return (
		<Button icon="/img/wax-chain-logo.wam" onClick={onClick}>
			{sale ? "Cancel Sale Offer" : "Offer for Sale"}
		</Button>
	);
};
