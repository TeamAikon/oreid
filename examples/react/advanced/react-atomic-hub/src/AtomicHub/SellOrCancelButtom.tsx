import { ChainNetwork } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { AtomichubAssets, AtomichubSale } from "./AtomicHubTypes";
import { ButtonGradient } from "./ButtonGradient";
import { cancelOreIdSaleTransaction } from "./helpers/cancelOreIdSaleTransaction";
import { createOreIdSaleTransaction } from "./helpers/createOreIdSaleTransaction";
import { getAssetSale } from "./helpers/getAssetSale";
import { transferTransaction } from "./helpers/transferTransaction";
import { aikonNftAuthor } from "../constants";
import { ErrorContext } from "./ErrorProvider/ErrorContext";

interface Props {
	asset: AtomichubAssets;
}

export const SellOrCancelButtom: React.FC<Props> = ({ asset }) => {
	const { setError } = useContext(ErrorContext);
	const [isLoading, setIsLoading] = useState(true);
	const [sale, setSale] = useState<AtomichubSale | undefined>();
	const [transactionId, setTransactionId] = useState("");
	const oreId = useOreId();

	useEffect(() => {
		setIsLoading(true);
		getAssetSale(asset.asset_id)
			.then((assetSale) => setSale(assetSale))
			.catch(setError)
			.finally(() => setIsLoading(false));
	}, [asset, setError]);

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
	}, [asset, oreId, setError]);

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
	}, [oreId, sale, setError]);

	// transfer NFT
	const transferNft = useCallback(async () => {
		// transfer to another account
		const transferParams = {
			assetIds: [asset.asset_id],
			fromAccount: oreId.auth.accountName,
			toAccount: aikonNftAuthor, // TODO: User should be able to enter this account name on the WaX network
			memo: "Transfer NFT",
			permission: "active",
			oreId,
			chainNetwork: ChainNetwork.WaxTest,
		};
		setIsLoading(true);
		transferTransaction(transferParams)
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
	}, [oreId, asset.asset_id, setError]);

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
		transferNft()
			.then(() => {
				// Do something
			})
			.catch(setError)
			.finally(() => setIsLoading(false));
	};

	if (isLoading) return <>Loading...</>;
	if (transactionId) {
		return (
			<>
				<a
					style={{ color: "#fff" }}
					href={`https://wax-test.bloks.io/transaction/${transactionId}`}
					target="_blank"
					rel="noopener noreferrer"
				>
					View on block explorer
				</a>
			</>
		);
	}
	return (
		<>
			<ButtonGradient onClick={onClickTransfer}>
				{"Transfer Back"}
			</ButtonGradient>
			<ButtonGradient
				icon="/img/wax-chain-logo.wam"
				onClick={onClickSellOrCancel}
			>
				{sale ? "Cancel Sale Offer" : "Offer for Sale"}
			</ButtonGradient>
		</>
	);
};
