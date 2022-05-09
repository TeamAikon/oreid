import { ChainNetwork } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useState } from "react";
import { AtomichubSale } from "./AtomicHubTypes";
import { Button } from "../Button";
import { createOreIdBuyTransaction } from "./helpers/createOreIdBuyTransaction";
import { shiftDecimal } from "./helpers/shiftDecimal";

interface Props {
	sale: AtomichubSale;
}

export const BuyButtom: React.FC<Props> = ({ sale }) => {
	const oreId = useOreId();
	const [isLoading, setIsLoading] = useState(false);
	const [transactionId, setTransactionId] = useState("");

	const onClick = () => {
		setIsLoading(true);
		createOreIdBuyTransaction({
			sale,
			oreId,
			chainNetwork: ChainNetwork.WaxTest,
		})
			.then((transaction) => {
				oreId.popup
					.sign({ transaction })
					.then((result) => {
						setTransactionId(result.transactionId || "");
						console.log({ result });
						setIsLoading(false);
					})
					.catch(console.error)
					.finally(() => setIsLoading(false));
			})
			.catch((error) => {
				console.error(error);
				setIsLoading(false);
			});
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
		<Button
			icon="/img/wax-chain-logo.wam"
			onClick={onClick}
			disabled={isLoading}
		>
			Buy for{" "}
			{shiftDecimal({
				amount: sale.price.amount,
				precision: sale.price.token_precision,
			})}{" "}
			{sale.price.token_symbol.toUpperCase()}
		</Button>
	);
};
