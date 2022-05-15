import { RPC } from "../helpers";

async function getAccountInfo(accountName: string) {
  const balance = await RPC.get_account(accountName);
  return balance;
}

(async () => {
  const accountName = "youraccount";
  console.log("accountInfo: ", getAccountInfo(accountName));
  process.exit();
})();
