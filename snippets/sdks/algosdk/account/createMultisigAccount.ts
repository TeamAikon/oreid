import algosdk from "algosdk";

function createMultisigAccount(
  version: number,
  threshold: number,
  ownerAddresses: string[]
) {
  const multisigOptions = {
    version,
    threshold,
    addrs: ownerAddresses,
  };
  const multisigAddress = algosdk.multisigAddress(multisigOptions);

  return multisigAddress;
}

(async () => {
  const owners = [
    "OQX6PWM37IXWRKBP43WFI7T7MYM4KKFYYOD4FMI4TOJ4N7W6XFW2IYB5B4",
    "B6EOTR7R5S5JS5Q33Z7ULJNZ7BQTMRRSLMC7QGPGOBVIOKSBKL2K5BHCQU",
  ];
  const threshold = 2;
  console.log(
    "createMultisigAccount: ",
    createMultisigAccount(1, threshold, owners)
  );
  process.exit();
})();
