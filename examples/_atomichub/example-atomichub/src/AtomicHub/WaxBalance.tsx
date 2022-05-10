import { ChainNetwork } from "oreid-js";
import React, { useEffect, useState } from "react";
import { getBalance } from "./helpers/getBalance";
import { shiftDecimal } from "./helpers/shiftDecimal";
import { useUsercChainAccount } from "./hooks/useUsercChainAccount";

export const WaxBalance: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | undefined>();
	const [balance, setBalance] = useState("0");
	const waxAccount = useUsercChainAccount({
		chainNetwork: ChainNetwork.WaxTest,
	});

	useEffect(() => {
		setError(undefined);
		getBalance({ chainAccount: waxAccount })
			.then((walletBalance) => setBalance(walletBalance))
			.catch(setError)
			.finally(() => setLoading(false));
	}, [waxAccount]);

	if (loading) return null;
	return (
		<>
			<h3>WAX Balance: {shiftDecimal({ precision: 8, amount: balance })}</h3>
			{error && (
				<div className="App-error-atomichub">Error: {error.message}</div>
			)}
		</>
	);
};
