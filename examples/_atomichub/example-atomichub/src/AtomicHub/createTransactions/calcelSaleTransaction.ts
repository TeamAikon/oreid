interface CancelSaleParams {
	accountName: string;
	permission: string;

	saleId: string;
	// offerId: string;
}
export const cancelSaleTransaction = ({
	accountName,
	permission,
	saleId,
}: // offerId,
CancelSaleParams) => {
	return [
		{
			account: "atomicmarket",
			name: "cancelsale",
			authorization: [
				{
					actor: accountName,
					permission,
				},
			],
			data: {
				sale_id: saleId,
			},
		},
		// ! Dosen't need to cancel the offer
		// {
		// 	account: "atomicassets",
		// 	name: "canceloffer",
		// 	authorization: [
		// 		{
		// 			actor: accountName,
		// 			permission,
		// 		},
		// 	],
		// 	data: {
		// 		offer_id: offerId,
		// 	},
		// },
	];
};
