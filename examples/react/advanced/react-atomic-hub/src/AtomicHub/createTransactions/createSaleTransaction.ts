import { shiftDecimal } from "../helpers/shiftDecimal";

interface SaleParams {
  accountName: string;
  permission: string;

  assetsId: string[];

  payment: {
    amount: string;
    tokenSymbol: string;
    tokenPrecision: number;
    settlementSymbolToAssert?: string;
  };
}
export const createSaleTransaction = ({
  accountName,
  permission,
  assetsId,
  payment,
}: SaleParams) => {
  const formattedAmount = shiftDecimal({
    amount: payment.amount,
    precision: payment.tokenPrecision,
  });
  return [
    {
      account: "atomicmarket",
      name: "announcesale",
      authorization: [
        {
          actor: accountName,
          permission,
        },
      ],
      data: {
        seller: accountName,
        asset_ids: assetsId,
        listing_price: `${formattedAmount} ${payment.tokenSymbol.toUpperCase()}`,
        settlement_symbol:
          payment.settlementSymbolToAssert || payment.tokenSymbol,
        maker_marketplace: "",
      },
    },
    {
      account: "atomicassets",
      name: "createoffer",
      authorization: [
        {
          actor: accountName,
          permission,
        },
      ],
      data: {
        sender: accountName,
        sender_asset_ids: assetsId,
        recipient: "atomicmarket",
        recipient_asset_ids: [] as any,
        memo: "sale",
      },
    },
  ];
};
