import { ChainNetwork } from "oreid-js";
import React, { useState } from "react";
import { ButtonGradient } from "../ButtonGradient";
import { callMintNft } from "../helpers/callMintNft";
import { useUsercChainAccount } from "../hooks/useUsercChainAccount";

import styles from "./ClaimMyToken.module.scss";

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
	const [claimed, setClaimed] = useState(false);
	const chainAccount = useUsercChainAccount({
		chainNetwork: ChainNetwork.WaxTest,
	});

	const onClick = () => {
		setIsLoading(true);
		mintMyNft({ chainAccount })
			.then(() => {
				setClaimed(true);
				setTimeout(() => {
					loadMyAssets();
				}, 5000);
			})
			.catch(setError)
			.finally(() => {
				setIsLoading(false);
			});
	};

	let label: string;
	if (isLoading) {
		label = "Claiming...";
	} else if (!claimed) {
		label = "Get my NFT";
	} else {
		label = "NFT Requested";
	}

	return (
		<div className={styles.ClaimMyToken}>
			<h3>Claim your Free Limited Edition NFT!</h3>
			<ButtonGradient onClick={onClick} disabled={isLoading || claimed}>
				{label}
			</ButtonGradient>
			{error && (
				<div className="App-error-AtomicHub">Error: {error.message}</div>
			)}
		</div>
	);
};
