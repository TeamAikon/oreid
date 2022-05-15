import algosdk from "algosdk";
import { ChainNetwork } from "oreid-js";
import { createOreIdTransaction, getOreIdChainInfo } from "../../oreid";
import { getAlgoClient } from "../helpers";

export async function composeAlgoSDKTransferTransaction(
  from: string,
  to: string,
  amount: number
) {
  // oreid-js automatically attaches suggestedParams
  const algoClient = getAlgoClient();
  const suggestedParams = await algoClient.getTransactionParams().do();
  const trxBody = {
    from,
    to,
    amount,
  };
  const algoTrx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    ...trxBody,
    suggestedParams,
  });
  return { trxBody, algoTrx, suggestedParams };
}

(async () => {
  const from = "OQX6PWM37IXWRKBP43WFI7T7MYM4KKFYYOD4FMI4TOJ4N7W6XFW2IYB5B4";
  const to = "B6EOTR7R5S5JS5Q33Z7ULJNZ7BQTMRRSLMC7QGPGOBVIOKSBKL2K5BHCQU";

  const txn1 = await composeAlgoSDKTransferTransaction(from, to, 10);
  const txn2 = await composeAlgoSDKTransferTransaction(from, to, 20);

  const group = Buffer.from(
    algosdk.computeGroupID([txn1.algoTrx, txn2.algoTrx])
  ).toString("base64");

  const transferTransactionData1 = {
    ...txn1.trxBody,
    ...txn1.suggestedParams,
    group,
  };
  const transferTransactionData2 = {
    ...txn2.trxBody,
    ...txn2.suggestedParams,
    group,
  };
  const transaction = await createOreIdTransaction({
    chainNetwork: ChainNetwork.AlgoTest, // "algo_test"
    transactionData: transferTransactionData1,
  });

  const { oreId } = getOreIdChainInfo(ChainNetwork.AlgoTest);
  await oreId.popup.sign({ transaction });

  process.exit();
})();
