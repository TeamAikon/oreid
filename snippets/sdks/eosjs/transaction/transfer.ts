import { createOreIdTransaction, getOreIdChainInfo } from "../../oreid";
import { ChainNetwork } from "oreid-js";

async function composeTransferTransaction(
  from: string,
  to: string,
  quantity: string
) {
  return [
    {
      account: "eosio.token",
      name: "transfer",
      authorization: [
        {
          actor: from,
          permission: "active",
        },
      ],
      data: {
        from,
        to,
        quantity,
        memo: "some memo",
      },
    },
  ];
}

(async () => {
  const from = "senderacc";
  const to = "receiveracc";

  const transferTransactionData = await composeTransferTransaction(
    from,
    to,
    "10.0000 EOS"
  );
  const transaction = await createOreIdTransaction({
    chainNetwork: ChainNetwork.EosKylin, // "eos_kylin"
    transactionData: transferTransactionData,
  });

  const { oreId } = getOreIdChainInfo(ChainNetwork.EosKylin);
  await oreId.popup.sign({ transaction });

  process.exit();
})();
