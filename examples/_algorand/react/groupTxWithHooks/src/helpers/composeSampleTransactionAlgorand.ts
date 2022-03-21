import {
	assignGroupIdAndReturnTransactions,
	composeTxOptIn,
	composeTxTransfer,
} from "../helpers/algorand";

export const composeSampleTransactionAlgorand = async ({
	chainAccount,
	txType,
	toAddress,
}: {
	chainAccount: string;
	txType: string;
	toAddress: string;
}) => {
	const txTransfer = composeTxTransfer(chainAccount, toAddress);
	const txOptIn = composeTxOptIn(chainAccount);

	if (txType === "transfer") {
		return txTransfer;
	}
	if (txType === "optin") {
		return txOptIn;
	}

	// calculate groupId for two transactions, then return each including groupId
	const { transaction1WithGroup, transaction2WithGroup } =
		await assignGroupIdAndReturnTransactions(txOptIn, txTransfer);

	return [transaction1WithGroup, transaction2WithGroup];
};
