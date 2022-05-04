import { ChainNetwork } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useState } from "react";
import { AtomichubAssets } from "./AtomicHubTypes";
import { getAssetsFromCollection } from "./helpers/getAssetsFromCollection";

interface Props {
	setAssets: (assets: AtomichubAssets[]) => void;
}

export const LoadMyAssets: React.FC<Props> = ({ setAssets }) => {
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
				console.error(error);
				setAssets([]);
			})
			.finally(() => setLoading(false));
	};
	return (
		<>
			<button disabled={loading} onClick={loadMyAssets}>
				{loading ? "Loading..." : "Load My Assets"}
			</button>
			<br />
		</>
	);
};
