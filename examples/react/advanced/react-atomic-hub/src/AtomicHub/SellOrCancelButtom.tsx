import { ChainNetwork } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../Button";
import { AtomichubAssets, AtomichubSale } from "./AtomicHubTypes";
import { cancelOreIdSaleTransaction } from "./helpers/cancelOreIdSaleTransaction";
import { createOreIdSaleTransaction } from "./helpers/createOreIdSaleTransaction";
import { getAssetSale } from "./helpers/getAssetSale";
import { transferTransaction } from "./helpers/transferTransaction";

interface Props {
	asset: AtomichubAssets;
}

type TransferInfo = {
	assetIds: string[];
	fromAccount: string;
	toAccount: string;
	memo: string;
	permission: string;
}

export const SellOrCancelButtom: React.FC<Props> = ({ asset }) => {
	const [error, setError] = useState<Error | undefined>();
	const [isLoading, setIsLoading] = useState(true);
	const [sale, setSale] = useState<AtomichubSale | undefined>();
	const [transferInfo, setTransferInfo] = useState<AtomichubSale | undefined>();
	const [transactionId, setTransactionId] = useState("");
	const oreId = useOreId();

	useEffect(() => {
		setIsLoading(true);
		getAssetSale(asset.asset_id)
			.then((assetSale) => setSale(assetSale))
			.catch(setError)
			.finally(() => setIsLoading(false));
	}, [asset]);

	// Create NFT Sale offer
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
					.catch(setError)
					.finally(() => setIsLoading(false));
			})
			.catch((error) => {
				setError(error);
				setIsLoading(false);
			});
	}, [asset, oreId]);

	// Cancel NFT Sale
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
					.catch(setError)
					.finally(() => setIsLoading(false));
			})
			.catch((error) => {
				setError(error);
				setIsLoading(false);
			});
	}, [oreId, sale]);

	// transfer NFT
	// const transfer = useCallback(async () => {
	// 	if (!transferInfo) return;
	// 	setIsLoading(true);
	// 	transferTransaction({
	// 		...transferInfo,
	// 		oreId,
	// 		chainNetwork: ChainNetwork.WaxTest,
	// 	})
	// 		.then((transaction) => {
	// 			oreId.popup
	// 				.sign({ transaction })
	// 				.then((result) => {
	// 					setTransactionId(result?.transactionId || "");
	// 				})
	// 				.catch(setError)
	// 				.finally(() => setIsLoading(false));
	// 		})
	// 		.catch((error) => {
	// 			setError(error);
	// 			setIsLoading(false);
	// 		});
	// }, [oreId, transferInfo]);

	if (!asset.is_transferable) return null;

	const onClickSellOrCancel = () => {
		setIsLoading(true);

		if (sale) {
			cancelAssetSale()
				.then(() => {
					// Do something
				})
				.catch(setError)
				.finally(() => setIsLoading(false));
			return;
		}

		createAssetSale()
			.then(() => {
				// Do something
			})
			.catch(setError)
			.finally(() => setIsLoading(false));
	};

	const onClickTransfer = () => {
		setIsLoading(true);

		cancelAssetSale()
			.then(() => {
				// Do something
			})
			.catch(setError)
			.finally(() => setIsLoading(false));
		return;

	};

	if (isLoading) return <>Loading...</>;
	if (transactionId) {
		return (
			<>
				<a
					style={{ color: "#fff" }}
					href={`https://wax-test.bloks.io/transaction/${transactionId}`}
					target="_blank"
					rel="noreferrer"
				>
					View on block explorer
				</a>
				{error && (
					<div className="App-error-atomichub">Error: {error.message}</div>
				)}
			</>
		);
	}
	return (
		<>
			<Button icon="/img/wax-chain-logo.wam" onClick={onClickSellOrCancel}>
				{"Transfer"}
			</Button>
			<Button icon="/img/wax-chain-logo.wam" onClick={onClickSellOrCancel}>
				{sale ? "Cancel Sale Offer" : "Offer for Sale"}
			</Button>
			{error && (
				<div className="App-error-atomichub">Error: {error.message}</div>
			)}
		</>
	);
};
