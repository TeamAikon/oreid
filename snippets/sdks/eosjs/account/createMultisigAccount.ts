import { getOreIdChainInfo, createOreIdTransaction } from "../../oreid";
import { ChainNetwork } from "oreid-js";
import { EosAuthorizationStruct } from "../models";
import { composeCreateAccountActions } from "..//helpers";

// There are 2 ways of achieving multisig authorization for an account.
//    1.  Just like creating a new account the standard way, instead of specifying a public key in keys array, specify multiple different key/weight tuples
//    2.  Instead of specifying keys the standard way, permission/weight tuples can be specified under accounts array.
//        This effectively means whatever signature satisfies that account/permission will be regarded as valid authentication for that permission/weight speficifed.
const newMultisigWithKeys: EosAuthorizationStruct = {
  threshold: 2,
  keys: [
    {
      key: "EOS....",
      weight: 1,
    },
    {
      key: "EOS....",
      weight: 1,
    },
  ],
  accounts: [],
  waits: [],
};
const newMultisigWithAccounts: EosAuthorizationStruct = {
  threshold: 2,
  keys: [],
  accounts: [
    {
      permission: {
        actor: "owner1",
        permission: "active",
      },
      weight: 1,
    },
    {
      permission: {
        actor: "owner2",
        permission: "active",
      },
      weight: 1,
    },
  ],
  waits: [],
};

(async () => {
  const createAccountActionData = composeCreateAccountActions(
    "creatoracc",
    "newaccount",
    {
      owner: newMultisigWithKeys,
      active: newMultisigWithAccounts,
    }
  );
  const transaction = await createOreIdTransaction({
    chainNetwork: ChainNetwork.EosKylin, // "eos_kylin"
    transactionData: createAccountActionData,
  });

  const { oreId } = getOreIdChainInfo(ChainNetwork.EosKylin);
  await oreId.popup.sign({ transaction });

  process.exit();
})();
