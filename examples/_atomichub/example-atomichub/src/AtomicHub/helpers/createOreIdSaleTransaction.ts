import { ChainNetwork, OreId, Transaction } from "oreid-js";
import { AtomichubAssets } from "../AtomicHubTypes";
import { createSaleTransaction } from "../createTransactions/createSaleTransaction";

export const createOreIdSaleTransaction = async ({
	oreId,
	chainNetwork,
	assets,
}: {
	assets: AtomichubAssets[];
	oreId: OreId;
	chainNetwork: ChainNetwork;
}): Promise<Transaction> => {
	const account = oreId.auth.user.data.chainAccounts.find(
		(chainAccount) => chainAccount.chainNetwork === chainNetwork
	);
	if (!account) {
		throw new Error(`No account found for ${chainNetwork}`);
	}

	const transactionData = createSaleTransaction({
		accountName: account.chainAccount,
		permission: "active",
		assetsId: assets.map((asset) => asset.asset_id),
		payment: {
			amount: "200000000",
			tokenPrecision: 8,
			tokenSymbol: "WAX",
			settlementSymbolToAssert: `8,WAX`,
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
