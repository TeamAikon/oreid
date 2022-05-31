import { NFTMarketplaceSale } from "../NFTMarketplaceTypes";

export const getSalesFromCollection = async ({
	collection,
}: {
	collection: string;
}): Promise<NFTMarketplaceSale[]> => {
	const response = await fetch(
		`https://test.wax.api.atomicassets.io/atomicmarket/v2/sales?state=1&collection_name=${collection}&page=1&limit=100&order=desc&sort=created`
	);
	const json = await response.json();
	return json?.data || [];
};
