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
			account: "atomicassets",
			name: "transfer",
			authorization: [
				{
					actor: fromAccount,
					permission,
				},
			],
			data: {
				from: fromAccount,
				to: toAccount,
			  asset_ids: assetIds,
				memo
			},
		},
	];
};
