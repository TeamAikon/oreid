import { getAlgoClient } from "../helpers";
import { ChainNetwork } from "oreid-js";
import { createOreIdTransaction, getOreIdChainInfo } from "../../oreid";

async function composeTransferTransaction(
  from: string,
  to: string,
  amount: number
) {
  // oreid-js automatically attaches suggestedParams if not provided, check transferSimple.ts
  const algoClient = getAlgoClient();
  const suggestedParams = await algoClient.getTransactionParams().do();
  const { fee, firstRound, lastRound, genesisID, genesisHash } =
    suggestedParams;
  return {
    from,
    to,
    amount,
    note: "transfer memo",
    type: "pay",
    fee,
    firstRound,
    lastRound,
    genesisID,
    genesisHash,
  };
}

(async () => {
  const sender = "OQX6PWM37IXWRKBP43WFI7T7MYM4KKFYYOD4FMI4TOJ4N7W6XFW2IYB5B4";
  const receiver = "B6EOTR7R5S5JS5Q33Z7ULJNZ7BQTMRRSLMC7QGPGOBVIOKSBKL2K5BHCQU";

  const transferTransactionData = await composeTransferTransaction(
    sender,
    receiver,
    10
  );
  const transaction = await createOreIdTransaction({
    chainNetwork: ChainNetwork.AlgoTest, // "algo_test"
    transactionData: transferTransactionData,
  });

  const { oreId } = getOreIdChainInfo(ChainNetwork.AlgoTest);
  await oreId.popup.sign({ transaction });

  process.exit();
})();
