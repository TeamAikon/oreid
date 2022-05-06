export const isAssetOnSale = async (assetId: string) => {
	const response = await fetch(
		`https://test.wax.api.atomicassets.io/atomicmarket/v2/sales?asset_id=${assetId}&page=1&limit=100&order=desc&sort=created`
	);
	const json = await response.json();
	const sales = json?.data || [];
	return sales.length >= 1;
};
