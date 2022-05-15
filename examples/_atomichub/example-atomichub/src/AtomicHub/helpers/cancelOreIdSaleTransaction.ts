import { ChainNetwork, OreId, Transaction } from "oreid-js";
import { AtomichubSale } from "../AtomicHubTypes";
import { cancelSaleTransaction } from "../createTransactions/calcelSaleTransaction";

export const cancelOreIdSaleTransaction = async ({
	oreId,
	chainNetwork,
	sale,
}: {
	sale: AtomichubSale;
	oreId: OreId;
	chainNetwork: ChainNetwork;
}): Promise<Transaction> => {
	const account = oreId.auth.user.data.chainAccounts.find(
		(chainAccount) => chainAccount.chainNetwork === chainNetwork
	);
	if (!account) {
		throw new Error(`No account found for ${chainNetwork}`);
	}

	const transactionData = cancelSaleTransaction({
		accountName: account.chainAccount,
		permission: "active",
		saleId: sale.sale_id,
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
