import { ChainNetwork } from "oreid-js";
import { useActionSign, useOreId } from "oreid-react";
import React, { useState } from "react";
import { AtomichubOffer } from "./AtomicHubTypes";
import { createOreIdBuyTransaction } from "./helpers/createOreIdBuyTransaction";

interface Props {
	offer: AtomichubOffer;
}

export const BuyButtom: React.FC<Props> = ({ offer }) => {
	const oreId = useOreId();
	const [isLoading, setIsLoading] = useState(false);
	const sign = useActionSign();
	const [transactionId, setTransactionId] = useState("");

	const onClick = () => {
		setIsLoading(true);
		createOreIdBuyTransaction({
			offer,
			oreId,
			chainNetwork: ChainNetwork.WaxTest,
		})
			.then((transaction) => {
				sign({
					transaction,
					onError: (error) => {
						console.log("onError: ", error);
						setIsLoading(false);
					},
					onSuccess: (result) => {
						setTransactionId(result.transactionId || "");
						console.log({ result });
						setIsLoading(false);
					},
				});
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
			Buy: {offer.sender_assets[0].data.name}
		</button>
	);
};
