/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import dotenv from "dotenv";
import {
  ChainFactory,
  ChainType,
  HelpersAlgorand,
  Models,
  ModelsAlgorand,
} from "@open-rights-exchange/chainjs";

const env: any = dotenv.config();

const algoApiKey = env.REACT_APP_AGLORAND_API_KEY;
const algoFundingPrivateKey = env.REACT_APP_ALGORAND_ALGO_FUNDING_PRIVATE_KEY as string;

const algoMainnetEndpoints = [
  {
    url: new URL("http://mainnet-algorand.api.purestake.io/ps1"),
    options: { headers: [{ "X-API-Key": algoApiKey }] },
  },
];
const algoTestnetEndpoints = [
  {
    url: new URL("http://testnet-algorand.api.purestake.io/ps1"),
    options: { headers: [{ "X-API-Key": algoApiKey }] },
  },
];
const algoBetanetEndpoints = [
  {
    url: new URL("http://betanet-algorand.api.purestake.io/ps1"),
    options: { headers: [{ "X-API-Key": algoApiKey }] },
  },
];

/** Transfer Algos to account - on TestNet */
export async function transferAlgosToAccount(
  algoPaymentParams: ModelsAlgorand.AlgorandActionPaymentParams
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
    HelpersAlgorand.toAlgorandPrivateKey(algoFundingPrivateKey),
  ]);
  return await transaction.send();
}
