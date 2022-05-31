import { ChainNetwork } from "oreid-js";
import React, { useState } from "react";
import { ButtonGradient } from "../ButtonGradient";
import { callMintNft } from "../helpers/callMintNft";
import { useUsercChainAccount } from "../hooks/useUsercChainAccount";

const mintMyNft = async ({ chainAccount }: { chainAccount: string }) => {
	// TODO: Call API to generate and send token to my account here.
	console.log("Claiming NFT");
	const transactionId =
		(await callMintNft({ accountName: chainAccount })) || {};
	console.log(`generated NFT - TxId: ${transactionId}`);
};

interface Props {
	loadMyAssets: () => void;
}

export const ClaimMyToken: React.FC<Props> = ({ loadMyAssets }) => {
	const [error, setError] = useState<Error | undefined>();
	const [isLoading, setIsLoading] = useState(false);
	const chainAccount = useUsercChainAccount({
		chainNetwork: ChainNetwork.WaxTest,
	});

	const onClick = () => {
		setIsLoading(true);
		mintMyNft({ chainAccount })
			.then(() => {
				setTimeout(() => {
					loadMyAssets();
				}, 5000);
			})
			.catch(setError)
			.finally(() => {
				setIsLoading(false);
			});
	};

	return (
		<>
			<h3>Claim your Free Limited Edition NFT!</h3>
			<ButtonGradient onClick={onClick} disabled={isLoading}>
				{isLoading ? "Claiming..." : "Get my NFT"}
			</ButtonGradient>
			{error && (
				<div className="App-error-atomichub">Error: {error.message}</div>
			)}
		</>
	);
};
