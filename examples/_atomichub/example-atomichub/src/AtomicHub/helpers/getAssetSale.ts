export const getAssetSale = async (assetId: string) => {
	const response = await fetch(
		`https://test.wax.api.atomicassets.io/atomicmarket/v2/sales?state=1&asset_id=${assetId}&page=1&limit=100&order=desc&sort=created`
	);
	const json = await response.json();
	const sales = json?.data || [];
	return sales[0];
};
