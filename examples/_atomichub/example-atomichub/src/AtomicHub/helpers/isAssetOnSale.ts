export const isAssetOnSale = async (assetId: string) => {
	const response = await fetch(
		`https://test.wax.api.atomicassets.io/atomicassets/v1/offers?asset_id=${assetId}&page=1&limit=100&order=desc&sort=created`
	);
	const json = await response.json();
	const offers = json?.data || [];
	return offers.length >= 1;
};
