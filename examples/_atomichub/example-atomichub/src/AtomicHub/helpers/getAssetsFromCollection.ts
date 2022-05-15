import { AtomichubAssets } from "../AtomicHubTypes";

export const getAssetsFromCollection = async ({
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
