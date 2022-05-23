interface TransferNftParams {
	fromAccount: string;
	permission: string;
	assetIds: string[];
	toAccount: string;
	memo: string;
}
export const transferNftTransaction = ({
	fromAccount,
	permission,
	toAccount,
	assetIds,
	memo
}: // offerId,
TransferNftParams) => {
	return [
		{
			account: "atomicmarket",
			name: "transfer",
			authorization: [
				{
					actor: fromAccount,
					permission,
				},
			],
			data: {
				account_from: fromAccount,
				account_to: toAccount,
			  asset_ids: assetIds,
				memo
			},
		},
	];
};
