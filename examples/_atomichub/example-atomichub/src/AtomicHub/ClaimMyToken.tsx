import { ChainNetwork } from "oreid-js";
import React, { useState } from "react";
import { Button } from "../Button";
import { useUsercChainAccount } from "./hooks/useUsercChainAccount";

const claimMyToken = async ({ chainAccount }: { chainAccount: string }) => {
	// TODO: Call API to generate and send token to my account here.
	console.log("Claiming!!!");
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
		claimMyToken({ chainAccount })
			.catch(setError)
			.finally(() => {
				setIsLoading(false);
				loadMyAssets();
			});
	};

	return (
		<>
			<h2>Welcome to ORE ID!</h2>
			<h3>Claim your Free Limited Edition NFT!</h3>
			<Button onClick={onClick} disabled={isLoading}>
				{isLoading ? "Claiming..." : "Get my NFT"}
			</Button>
			{error && (
				<div className="App-error-atomichub">Error: {error.message}</div>
			)}
		</>
	);
};
