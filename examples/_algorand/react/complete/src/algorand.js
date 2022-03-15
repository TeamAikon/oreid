/* eslint-disable quote-props */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import dotenv from 'dotenv';

dotenv.config();

// The function below emmulates getting the latest chain params
// For the sample transaction to work, you must update 'last-round' with current values from the chain. Get those by running the following command...
// curl -X GET \
//   'https://testnet-algorand.api.purestake.io/ps2/v2/transactions/params' \
//   -H 'X-API-Key : *{your purestake.io api key}*'
export function getLatestChainTransactionParams() {
  return {
    consensusVersion:'https://github.com/algorandfoundation/specs/tree/3a83c4c743f8b17adfd73944b4319c25722a6782',
    fee: 0,
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    genesisId: 'testnet-v1.0',
    lastRound:9670570,
    minFee: 1000
  };
}

/** Send 1 microAlgos from the user's account to some other account */
export async function composeAlgorandSampleTransaction(userAccount, toAddress) {
  let params = getLatestChainTransactionParams();
  return {
    from: userAccount,
    to: toAddress,
    amount: 1,
    note: 'transfer memo',
    fee: params.minFee,
    type: 'pay',
    firstRound: params.lastRound,
    lastRound: params.lastRound + 1000,
    genesisID: params.genesisId,
    genesisHash: params.genesisHash
  };
}

/**
 * Returns the multisig metadata for a specific ORE ID account (if it exists)
 */
export const getMultisigMetadata = (userInfo, chainAccount) => {
  const chainAccountInfo = userInfo?.permissions?.find(
    (permission) => permission.chainAccount === chainAccount
  );
  return chainAccountInfo?.metadata?.algorandMultisig;
};

/**
 * Returns comma seperated list of chainAccounts required for the multsig transaction
 * ORE ID will add signatures to the transaction for all these accounts
 *
 * For an Algorand multisig account created by OREID, the user has two Algorand addresses in use..
 * 1) Multisig 'Asset Account' address - the address which is the hash of all the multisig metadata - this address is the target of the transaction
 * 2) 'Key Account` address - the address for which the user controls the private key with his ORE ID account - it is one of the signing parties to the multisig transaction
 *
 * When ORE ID signs an multisig transaction, it attaches the user's signaure from his KeyAccount (after he enters his PIN on the sign UX)
 * It then attaches the signatures for all the other accounts/addresses included in this comma-seperated list - ORE ID must manage the private keys for these other accounts
 *
 * Which accounts compose the multisig transaction MUST be decided by the app developer prior to ORE ID creating multisig acconts for users
 */
export const getMultisigChainAccountsForTransaction = (userInfo, chainAccount) => {
  const algorandMultisig = getMultisigMetadata(userInfo, chainAccount);
  const requiredAccountsForMultiSigTransaction = []; // put list of signatures required to sign here
  if (!algorandMultisig) return null;
  const keyAccount = userInfo.permissions.find((permission) => algorandMultisig.addrs?.includes(permission?.chainAccount));
  requiredAccountsForMultiSigTransaction.push(keyAccount?.chainAccount);
  return requiredAccountsForMultiSigTransaction.join(',');
};
