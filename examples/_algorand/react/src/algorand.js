/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import dotenv from 'dotenv';
import {
  ChainFactory,
  ChainType,
  HelpersAlgorand,
  Models,
  ModelsAlgorand
} from '@open-rights-exchange/chainjs';
import { isNullOrUndefined } from 'util';

dotenv.config();

const algorandApiKey = process.env.REACT_APP_ALGORAND_API_KEY;
const algoFundingPrivateKey =
  process.env.REACT_APP_ALGORAND_ALGO_FUNDING_PRIVATE_KEY;
const multisigAccountSigningKey =
  process.env.REACT_APP_ALGORAND_MULTISIG_ACCOUNT;

const algoMainnetEndpoints = [
  {
    url: new URL('http://mainnet-algorand.api.purestake.io/ps1'),
    options: { headers: [{ 'X-API-Key': algorandApiKey }] }
  }
];
const algoTestnetEndpoints = [
  {
    url: new URL('http://testnet-algorand.api.purestake.io/ps1'),
    options: { headers: [{ 'X-API-Key': algorandApiKey }] }
  }
];
const algoBetanetEndpoints = [
  {
    url: new URL('http://betanet-algorand.api.purestake.io/ps1'),
    options: { headers: [{ 'X-API-Key': algorandApiKey }] }
  }
];

/** Transfer Algos to account - on TestNet */
export async function transferAlgosToAccount(
  algoPaymentParams // Typescript type: ModelsAlgorand.AlgorandActionPaymentParams
) {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(
    ChainType.AlgorandV1,
    algoTestnetEndpoints
  );
  await algoTest.connect();

  /** Compose and send transaction */
  const transaction = algoTest.new.Transaction();

  // Compose an action from basic parameters using composeAction function
  const action = await algoTest.composeAction(
    ModelsAlgorand.AlgorandChainActionType.Payment,
    algoPaymentParams
  );
  transaction.actions = [action];
  await transaction.prepareToBeSigned();
  await transaction.validate();
  await transaction.sign([
    HelpersAlgorand.toAlgorandPrivateKey(algoFundingPrivateKey)
  ]);
  console.log('transaction:', transaction);
  return await transaction.send();
}

// Typescript type:
// type Permission {
//   accountType: string
//   chainAccount: string
//   chainNetwork: string
//   externalWalletType: string
//   permission: string
//   permissionName: string
//   privateKeyStoredExterally: boolean
//   publicKey: string
// }

/**
 * Returns the multisig metadata for a specific account if it exists
 */
export const getMultisigMetadata = (userInfo, chainAccount) => {
  const chainAccountInfo = userInfo?.permissions?.find(
    (permission) => permission.chainAccount === chainAccount
  );
  return chainAccountInfo?.metadata?.algorandMultisig;
};

/**
 * Returns the required chainAccounts for the multsig transaction.
 * The `keyAccount` is in the users permissions and used to create the multisig (asset) account
 * We find the keyAccount in user.permissions and add `multisigAccountSigningKey` which is the second
 * account that will sign.
 *
 * Which account to use for multisigAccountSigningKey MUST be decided by the developer and be one of the
 * keys in the `addrs` field on chain.
 */
export const getMultisigChainAccountsForTransaction = (
  userInfo,
  chainAccount
) => {
  const algorandMultisig = getMultisigMetadata(userInfo, chainAccount);

  if (isNullOrUndefined(algorandMultisig)) {
    return null;
  }

  const keyAccount = userInfo.permissions.find((permission) => algorandMultisig.addrs?.includes(permission?.chainAccount)
  );

  return `${keyAccount?.chainAccount},${multisigAccountSigningKey}`;
};

/** Send 1 microAlgos from the user's account to some other account */
export async function composeAlgorandSampleTransaction(userAccount, toAddress) {
  // return await preparePaymentTransaction({
  //   from: userAccount,
  //   to: toAddress,
  //   amount: 1,
  //   note: "transfer memo",
  // });
  return {
    from: userAccount,
    to: toAddress,
    amount: 1,
    note: 'transfer memo',
    fee: 1000,
    type: 'pay',
    firstRound: 9468939,
    lastRound: 9469939,
    genesisID: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
  };
}

/** Send .1 Algos to an account */
export function composeAlgorandFundingTransaction(userAccount, fromAddress) {
  const transaction = {
    actions: [
      {
        from: fromAddress,
        to: userAccount,
        amount: 100000, // minimum amount required to activate an account (.1 Algos)
        note: 'initial accnt funding',
        type: 'pay'
      }
    ]
  };
  return transaction;
}

export async function preparePaymentTransaction(transactionParams) {
  /** Create Algorand chain instance */
  const algoTest = new ChainFactory().create(
    ChainType.AlgorandV1,
    algoTestnetEndpoints
  );
  await algoTest.connect();

  /** Compose and send transaction */
  const transaction = algoTest.new.Transaction();

  // Compose an action from basic parameters using composeAction function
  const action = await algoTest.composeAction(
    ModelsAlgorand.AlgorandChainActionType.Payment,
    transactionParams
  );
  transaction.actions = [action];

  return action;
}
