import { ChainNetwork } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useState } from "react";
import { AtomichubSale } from "./AtomicHubTypes";
import { ButtonGradient } from "./ButtonGradient";
import { createOreIdBuyTransaction } from "./helpers/createOreIdBuyTransaction";
import { precisionDisplay } from "./helpers/precisionDisplay";
import { shiftDecimal } from "./helpers/shiftDecimal";

interface Props {
	sale: AtomichubSale;
}

export const BuyButtom: React.FC<Props> = ({ sale }) => {
	const oreId = useOreId();
	const [error, setError] = useState<Error | undefined>();
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
						setIsLoading(false);
					})
					.catch(setError)
					.finally(() => setIsLoading(false));
			})
			.catch((error) => {
				setError(error);
				setIsLoading(false);
			});
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
				{error && (
					<div className="App-error-atomichub">Error: {error.message}</div>
				)}
			</>
		);
	}
	return (
		<>
			<ButtonGradient
				icon="/img/wax-chain-logo.wam"
				onClick={onClick}
				disabled={isLoading}
			>
				{precisionDisplay({
					value: shiftDecimal({
						amount: sale.price.amount,
						precision: sale.price.token_precision,
					}),
					precision: 5,
				})}{" "}
				{sale.price.token_symbol.toUpperCase()}
			</ButtonGradient>
			{error && (
				<div className="App-error-atomichub">Error: {error.message}</div>
			)}
		</>
	);
};
