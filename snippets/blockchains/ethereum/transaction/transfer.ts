/*
Ethereum Native Token Transfer Transaction

Date: Nov 2022
*/
import { createOreIdTransaction, getOreIdChainInfo } from "../../../common/oreidjs/helpers";
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
    chainNetwork: ChainNetwork.EthGoerli,
    transactionData: transferTransactionData,
  });

  const { oreId } = getOreIdChainInfo(ChainNetwork.EthRopsten);
  await oreId.popup.sign({ transaction });

  process.exit();
})();
