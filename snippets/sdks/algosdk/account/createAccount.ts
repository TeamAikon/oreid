import algosdk from "algosdk";

function createAccount() {
  const newAccount = algosdk.generateAccount();
  const { sk: secretKey, addr: address } = newAccount;
  return {
    secretKey,
    address,
  };
}

(async () => {
  console.log("createAccount: ", createAccount());
  process.exit();
})();
