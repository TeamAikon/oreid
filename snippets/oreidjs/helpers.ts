import { ChainNetwork, OreId, Transaction } from "oreid-js";
import { WebPopup } from "oreid-webpopup";

const appId = "appid...";
const apiKey = "apikey..";

export const oreId = new OreId({ appName: "My App", appId, apiKey, plugins:{ popup: WebPopup() } });

export function getOreIdChainInfo(chainNetwork: string) {
  const accountName = oreId.auth.user.data.accountName
  const chainAccountData = oreId.auth.user.data.chainAccounts.find(
    (chainAccount) => chainAccount.chainNetwork === chainNetwork
  );
  return { accountName, chainAccountData, oreId };
}

export const createOreIdTransaction = async ({
  chainNetwork,
	transactionData
}: {
  chainNetwork: ChainNetwork
	transactionData: any
}): Promise<Transaction> => {
  const chainAccountData = oreId.auth.user.data.chainAccounts.find(
    (chainAccount) => chainAccount.chainNetwork === chainNetwork
  );
	return oreId.createTransaction({
		account: oreId.auth.user.data.accountName,
		chainAccount: chainAccountData.chainAccount,
		chainNetwork: chainAccountData.chainNetwork,
		transaction: { actions: transactionData } as any,
		signOptions: { broadcast: true },
	});
};
