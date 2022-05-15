import { createOreIdTransaction, getOreIdChainInfo } from "../../oreid";
import { ChainNetwork } from "oreid-js";

function composeTransferTransaction(from: string, to: string, value: number) {
  return {
    from,
    to,
    value, // wei amount to send out of oreid user wallet
  };
}

(async () => {
  const from = "0x...";
  const to = "0x...";

  const transferTransactionData = composeTransferTransaction(
    from,
    to,
    10 // wei
  );
  const transaction = await createOreIdTransaction({
    chainNetwork: ChainNetwork.EthRopsten, // "eth_ropsten"
    transactionData: transferTransactionData,
  });

  const { oreId } = getOreIdChainInfo(ChainNetwork.EthRopsten);
  await oreId.popup.sign({ transaction });

  process.exit();
})();
