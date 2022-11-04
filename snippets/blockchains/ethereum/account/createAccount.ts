/* 
Web3 Ethereum Account Creation

*/

import { web3 } from "../helpers";

function createAccount() {
  const newAccount = web3.eth.accounts.create();
  const { address, privateKey } = newAccount;
  return {
    address,
    privateKey,
  };
}

(async () => {
  console.log("createAccount: ", createAccount());
  process.exit();
})();
