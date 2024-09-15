/*
Web3 Ethereum Transaction Gas Fee Estimation

Note: Pass a transaction object into getFeeInfo()
      function.

      The fee info will be calculated and returned.
*/
import { TransactionConfig } from "../models";
import { web3 } from "../helpers";

async function getFeeInfo(transaction: TransactionConfig) {
  const gasPrice = await web3.eth.getGasPrice();

  const estimatedGas = await web3.eth.estimateGas(transaction);
  return {
    gasPrice,
    estimatedGas,
  };
}

(async () => {
  const trxToEstime: TransactionConfig = {
    from: "0x...",
    to: "0x...",
    value: 10, // wei
    data: "0x...",
  };
  const feeInfo = getFeeInfo(trxToEstime);
  console.log('Fee info: ', feeInfo)
})();
