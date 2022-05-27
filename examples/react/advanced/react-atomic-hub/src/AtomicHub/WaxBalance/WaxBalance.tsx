import { ChainNetwork } from "oreid-js";
import React, { useEffect, useState } from "react";
import { Card } from "../Card";
import { getBalance } from "../helpers/getBalance";
import { shiftDecimal } from "../helpers/shiftDecimal";
import { useUsercChainAccount } from "../hooks/useUsercChainAccount";
import { ReactComponent as WaxIcon } from "./WaxIcon.svg";

import styles from "./WaxBalance.module.scss";
import { precisionDisplay } from "../helpers/precisionDisplay";

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
		<Card>
			<div className={styles.WaxBalance}>
				<span>Balance:</span> <WaxIcon />
				<span>
					{precisionDisplay({
						value: shiftDecimal({ precision: 8, amount: balance }),
						precision: 5,
					})}{" "}
					WAX
				</span>
				{error && (
					<div className="App-error-atomichub">Error: {error.message}</div>
				)}
			</div>
		</Card>
	);
};
