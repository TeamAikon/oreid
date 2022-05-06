import { toEosAsset } from "../helpers/toEosAsset";

interface BuyParams {
	accountName: string;
	permission: string;

	saleId: string;
	assetsIdToBuy: string[];

	payment: {
		amount: string;
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
	saleId,
	assetsIdToBuy,
	payment,
	intendedDelphiMedian,
	takerMarketplace,
}: BuyParams) => {
	const priceString = `${payment.amount} ${payment.tokenSymbol.toUpperCase()}`;

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
				settlement_symbol_to_assert: payment.tokenSymbol,
			},
		},
		{
			account: payment.tokenContract,
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
