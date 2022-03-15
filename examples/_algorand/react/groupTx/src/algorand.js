import * as algosdk from "algosdk";
import { ChainFactory } from "@open-rights-exchange/chainjs";
import "./App.css";
import { ChainType } from "@open-rights-exchange/chainjs/dist/models";

const algoTestnetEndpoints = [
  {
    url: "https://testnet-algorand.api.purestake.io/ps2",
    options: {
      indexerUrl: "https://testnet-algorand.api.purestake.io/idx2",
      headers: [{ "x-api-key": process.env.REACT_APP_AGLORAND_API_KEY }],
    },
  },
];

const DEFAULT_TO_ADDRESS =
  "VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ";

export function composeTxTransfer(chainAccount, toAddress) {
  const transaction = {
    from: chainAccount,
    to: toAddress || DEFAULT_TO_ADDRESS,
    assetIndex: 10458941,
    amount: 1,
    type: "axfer",
  };
  return transaction;
}

export function composeTxOptIn(chainAccount) {
  const transaction = {
    from: chainAccount,
    to: chainAccount,
    assetIndex: 10458941,
    amount: 0,
    type: "axfer",
  };
  return transaction;
}

export async function getSuggestedParams() {
  const chain = new ChainFactory().create(
    ChainType.AlgorandV1,
    algoTestnetEndpoints
  );
  await chain.connect();
  return chain.algoClient.getTransactionParams().do();
}

/** Calculate a groupId for two transactions and return an updated transaction that includes the group */
export async function assignGroupIdAndReturnTransactions(
  transaction1,
  transaction2
) {
  const suggestedParams = await getSuggestedParams();

  const algoTransaction1 = algosdk.makeAssetTransferTxnWithSuggestedParams(
    transaction1.from,
    transaction1.to,
    undefined,
    undefined,
    transaction1.amount,
    undefined,
    transaction1.assetIndex,
    suggestedParams
  );

  const algoTransaction2 = algosdk.makeAssetTransferTxnWithSuggestedParams(
    transaction2.from,
    transaction2.to,
    undefined,
    undefined,
    transaction2.amount,
    undefined,
    transaction2.assetIndex,
    suggestedParams
  );
  
  // calculate a groupId for the two transactions together
  const group = Buffer.from(
    algosdk.computeGroupID([algoTransaction1, algoTransaction2])
  ).toString("base64");

  // add group and suggestedParams to each transaction
  const transaction1WithGroup = {
    ...transaction1,
    ...suggestedParams,
    group,
  };
  const transaction2WithGroup = {
    ...transaction2,
    ...suggestedParams,
    group,
  };
  return { transaction1WithGroup, transaction2WithGroup };
}

export async function sendGroupTransactions(trx1, trx2) {
  const chain = new ChainFactory().create(
    ChainType.AlgorandV1,
    algoTestnetEndpoints
  );
  await chain.connect();
  const sendResult = await chain.algoClient
    .sendRawTransaction([trx1, trx2])
    .do();
  return sendResult;
}

export function replaceFromToFeilds(transaction, from, to) {
  const transferTrx = {
    ...transaction,
    from,
    to,
  };
  return transferTrx;
}

export async function convertSignedTransactionToRaw(
  transactionResult,
  signature
) {
  const chain = new ChainFactory().create(
    ChainType.AlgorandV1,
    algoTestnetEndpoints
  );
  await chain.connect();
  const transaction = await chain.new.Transaction();
  await transaction.setTransaction(transactionResult);
  await transaction.prepareToBeSigned();
  await transaction.validate();
  await transaction.addSignatures([signature]);

  return transaction.raw;
}
