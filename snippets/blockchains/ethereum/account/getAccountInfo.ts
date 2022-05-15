import { web3 } from "../helpers";


async function getBalance(address: string) {
  return web3.eth.getBalance(address)
  }
  
(async () => {
  const address = "ethaddres..";
  console.log("accountBalance: ", (await getBalance(address)));
  process.exit();
})();
