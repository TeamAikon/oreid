import { ChainNetwork } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useState } from "react";
import { AtomichubAssets } from "./AtomicHubTypes";

const fetchDataFromAtomicHub = async ({
	waxAccount,
	collection,
}: {
	waxAccount: string;
	collection: string;
}): Promise<AtomichubAssets[]> => {
	const response = await fetch(
		`https://test.wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=${collection}&owner=${waxAccount}&page=1&limit=1000&order=desc&sort=asset_id`
	);
	const json = await response.json();
	return json?.data || [];
};

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

	const loadAssets = () => {
		setLoading(true);
		fetchDataFromAtomicHub({ waxAccount, collection: "orenetworkv1" })
			.then((myAssets) => setAssets(myAssets))
			.catch((error) => {
				console.error(error);
				setAssets([]);
			})
			.finally(() => setLoading(false));
	};
	return (
		<>
			<button disabled={loading} onClick={loadAssets}>
				{loading ? "Loading..." : "Load My Assets"}
			</button>
			<br />
		</>
	);
};
