import { ChainNetwork, OreId, Transaction } from "oreid-js";
import { transferNftTransaction } from "../createTransactions/transferTransaction";

export const transferTransaction = async ({
	oreId,
	assetIds,
	chainNetwork,
	fromAccount,
	toAccount,
	memo,
	permission,
}: {
	oreId: OreId;
	chainNetwork: ChainNetwork;
	assetIds: string[];
	fromAccount: string;
	toAccount: string;
	memo: string;
	permission?: string;
}): Promise<Transaction> => {
	const account = oreId.auth.user.data.chainAccounts.find(
		(chainAccount) => chainAccount.chainNetwork === chainNetwork
	);
	if (!account) {
		throw new Error(`No account found for ${chainNetwork}`);
	}

	const transactionData = transferNftTransaction({
		assetIds,
		fromAccount,
		toAccount,
		permission: permission || "active",
		memo,
		// offerId: sale.offer_id,
	});

	return oreId.createTransaction({
		account: oreId.auth.user.data.accountName,
		chainAccount: account.chainAccount,
		chainNetwork: account.chainNetwork,
		transaction: { actions: transactionData } as any,
		signOptions: { broadcast: true },
	});
};
