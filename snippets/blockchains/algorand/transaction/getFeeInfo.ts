import { getAlgoClient } from "../helpers";
import { composeAlgoSDKTransferTransaction } from "./groupTransaction";

async function getFeeInfo() {
  let algodClient = getAlgoClient();
  const { fee } = await algodClient.getTransactionParams().do();
  return fee; // per byte
}

(async () => {
  const from = "OQX6PWM37IXWRKBP43WFI7T7MYM4KKFYYOD4FMI4TOJ4N7W6XFW2IYB5B4";
  const to = "B6EOTR7R5S5JS5Q33Z7ULJNZ7BQTMRRSLMC7QGPGOBVIOKSBKL2K5BHCQU";
  const { algoTrx } = await composeAlgoSDKTransferTransaction(from, to, 10);

  const feePerByte = await getFeeInfo();
  const bytes = algoTrx.estimateSize();

  console.log("Chain fee per byte: ", feePerByte);
  console.log("Transaction estimated size: ", bytes);
  console.log("Total fee estimation: ", bytes * feePerByte);

  process.exit();
})();
