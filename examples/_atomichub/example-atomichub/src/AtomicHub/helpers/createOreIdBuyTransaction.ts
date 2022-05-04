import { ChainNetwork, OreId, Transaction } from "oreid-js";
import { AtomichubOffer } from "../AtomicHubTypes";
import { createBuyNftTransaction } from "../createTransactions/createBuyNftTransaction";

export const createOreIdBuyTransaction = async ({
	oreId,
	chainNetwork,
	offer,
}: {
	offer: AtomichubOffer;
	oreId: OreId;
	chainNetwork: ChainNetwork;
}): Promise<Transaction> => {
	const account = oreId.auth.user.data.chainAccounts.find(
		(chainAccount) => chainAccount.chainNetwork === chainNetwork
	);
	if (!account) {
		throw new Error(`No account found for ${chainNetwork}`);
	}

	// TODO: get the correct sale_id
	const transactionData = createBuyNftTransaction({
		accountName: account.chainAccount,
		permission: "active",
		assetsIdToBuy: offer.sender_assets.map((asset) => asset.asset_id),
		priceString: "0",
		saleId: offer.offer_id,
	});

	console.log("transactionData: ", JSON.stringify(transactionData));

	return oreId.createTransaction({
		account: oreId.auth.user.data.accountName,
		chainAccount: account.chainAccount,
		chainNetwork: account.chainNetwork,
		transaction: { actions: transactionData } as any,
		signOptions: { broadcast: true },
	});
};
