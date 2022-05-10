import { ChainNetwork } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useState } from "react";
import { AtomichubAssets } from "./AtomicHubTypes";
import { Button } from "../Button";
import { getAssetsFromCollection } from "./helpers/getAssetsFromCollection";

interface Props {
	setAssets: (assets: AtomichubAssets[]) => void;
}

export const LoadMyAssets: React.FC<Props> = ({ setAssets }) => {
	const [error, setError] = useState<Error | undefined>();
	const [loading, setLoading] = useState(false);
	const oreId = useOreId();
	const account = oreId.auth.user.data.chainAccounts.find(
		(chainAccount) => chainAccount.chainNetwork === ChainNetwork.WaxTest
	);

	const waxAccount = account?.chainAccount || "";
	// const waxAccount = "testsataikon";

	const loadMyAssets = () => {
		setLoading(true);
		getAssetsFromCollection({ waxAccount, collection: "orenetworkv1" })
			.then((myAssets) => setAssets(myAssets))
			.catch((error) => {
				setError(error);
				setAssets([]);
			})
			.finally(() => setLoading(false));
	};
	return (
		<>
			<Button disabled={loading} onClick={loadMyAssets}>
				{loading ? "Loading..." : "Load My Assets"}
			</Button>
			{error && (
				<div className="App-error-atomichub">Error: {error.message}</div>
			)}
			<br />
		</>
	);
};
