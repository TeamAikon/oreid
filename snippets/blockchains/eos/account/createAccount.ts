import { getOreIdChainInfo, createOreIdTransaction } from "../../oreid";
import { ChainNetwork } from "oreid-js";
import { EosAuthorizationStruct } from "../models";
import { composeCreateAccountActions } from "..//helpers";

const newAccountAuth: EosAuthorizationStruct = {
  threshold: 1,
  keys: [
    {
      key: "EOS....",
      weight: 1,
    },
  ],
  accounts: [],
  waits: [],
};

(async () => {
  const createAccountActionData = composeCreateAccountActions(
    "creatoracc",
    "newaccount",
    {
      owner: newAccountAuth,
      active: newAccountAuth,
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
