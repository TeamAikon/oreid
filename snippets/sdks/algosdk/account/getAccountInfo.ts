import { getAlgoClient } from "../helpers";

async function getAccountInfo(address: string) {
  const algodClient = getAlgoClient();
  const accountInfo = await algodClient.accountInformation(address).do();
  return accountInfo;
}

(async () => {
  const address = "OQX6PWM37IXWRKBP43WFI7T7MYM4KKFYYOD4FMI4TOJ4N7W6XFW2IYB5B4";
  console.log("accountInfo: ", getAccountInfo(address));
  process.exit();
})();
