interface BuyParams {
	accountName: string;
	permission: string;

	saleId: string;
	priceString: string;
	assetsIdToBuy: string[];

	payment?: {
		tokenContract: string;
		tokenPrecision: number;
		tokenSymbol: string;
	};
	intendedDelphiMedian?: number;
	takerMarketplace?: string;
}
export const createBuyNftTransaction = ({
	accountName,
	permission,
	priceString,
	saleId,
	assetsIdToBuy,
	payment,
	intendedDelphiMedian,
	takerMarketplace,
}: BuyParams) => {
	// TODO: Get WAX contract name
	const tokenInfo = payment || {
		tokenContract: "eosio.token",
		tokenPrecision: 8,
		tokenSymbol: "WAX",
	};

	return [
		{
			account: "atomicmarket",
			name: "assertsale",
			authorization: [
				{
					actor: accountName,
					permission,
				},
			],
			data: {
				sale_id: saleId,
				asset_ids_to_assert: assetsIdToBuy,
				listing_price_to_assert: priceString,
				settlement_symbol_to_assert: `${tokenInfo.tokenPrecision},${tokenInfo.tokenSymbol}`,
			},
		},
		{
			account: tokenInfo.tokenContract,
			name: "transfer",
			authorization: [
				{
					actor: accountName,
					permission,
				},
			],
			data: {
				from: accountName,
				to: "atomicmarket",
				quantity: priceString,
				memo: "deposit",
			},
		},
		{
			account: "atomicmarket",
			name: "purchasesale",
			authorization: [
				{
					actor: accountName,
					permission,
				},
			],
			data: {
				buyer: accountName,
				sale_id: saleId,
				intended_delphi_median: intendedDelphiMedian || 0,
				taker_marketplace: takerMarketplace || "",
			},
		},
	];
};
