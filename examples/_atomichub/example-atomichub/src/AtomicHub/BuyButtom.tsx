import { ChainNetwork } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useState } from "react";
import { AtomichubSale } from "./AtomicHubTypes";
import { createOreIdBuyTransaction } from "./helpers/createOreIdBuyTransaction";

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
				href={`https://wax-test.bloks.io/transaction/${transactionId}`}
				target="_blank"
				rel="noreferrer"
			>
				{transactionId}
			</a>
		);
	}
	return (
		<button onClick={onClick} disabled={isLoading}>
			Buy: {sale.assets[0].data.name}
		</button>
	);
};
