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
	const [isLoading, setIsLoading] = useState(false);
	const chainAccount = useUsercChainAccount({
		chainNetwork: ChainNetwork.WaxTest,
	});

	const onClick = () => {
		setIsLoading(true);
		claimMyToken({ chainAccount })
			.catch(console.error)
			.finally(() => {
				setIsLoading(false);
				loadMyAssets();
			});
	};

	return (
		<Button onClick={onClick} disabled={isLoading}>
			{isLoading ? "Claiming..." : "Claim my token"}
		</Button>
	);
};
