import { ChainNetwork, OreId, Transaction } from "oreid-js";
import { AtomichubSale } from "../AtomicHubTypes";
import { createBuyNftTransaction } from "../createTransactions/createBuyNftTransaction";

export const createOreIdBuyTransaction = async ({
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

	const transactionData = createBuyNftTransaction({
		accountName: account.chainAccount,
		permission: "active",
		assetsIdToBuy: sale.assets.map((asset) => asset.asset_id),
		saleId: sale.sale_id,
		payment: {
			amount: sale.price.amount,
			tokenContract: sale.price.token_contract,
			tokenPrecision: sale.price.token_precision,
			tokenSymbol: sale.price.token_symbol,
			settlementSymbolToAssert: `${sale.price.token_precision},${sale.price.token_symbol}`,
		},
	});

	return oreId.createTransaction({
		account: oreId.auth.user.data.accountName,
		chainAccount: account.chainAccount,
		chainNetwork: account.chainNetwork,
		transaction: { actions: transactionData } as any,
		signOptions: { broadcast: true },
	});
};
