import { GnosisMultisigOptions } from "../models";
import {
  ethersJsonRpc,
  getCreateProxyInitializerData,
  getProxyFactoryEthersContract,
} from "../helpers";
import { createOreIdTransaction, getOreIdChainInfo } from "../../oreid";
import { ChainNetwork } from "oreid-js";

async function calculateGnosisMultisigAddress(
  multisigOptions: GnosisMultisigOptions
) {
  const { gnosisSafeMaster, proxyFactory, saltNonce } = multisigOptions;
  ethersJsonRpc;
  const proxyFactoryContract = getProxyFactoryEthersContract(proxyFactory);
  const initializerData = await getCreateProxyInitializerData(multisigOptions);
  let address;
  try {
    address = await proxyFactoryContract.callStatic.createProxyWithNonce(
      gnosisSafeMaster,
      initializerData,
      saltNonce
    );
  } catch (err) {
    throw new Error("Invalid create options. Try increasing saltNonce");
  }
  return address;
}

export async function getCreateProxyTransaction(
  multisigOptions: GnosisMultisigOptions
): Promise<{ to: string; data: string; value: string | number }> {
  const { gnosisSafeMaster, proxyFactory, saltNonce } = multisigOptions;
  ethersJsonRpc;
  const proxyFactoryContract = getProxyFactoryEthersContract(proxyFactory);
  const initializerData = await getCreateProxyInitializerData(multisigOptions);
  const { to, data, value } =
    await proxyFactoryContract.populateTransaction.createProxyWithNonce(
      gnosisSafeMaster,
      initializerData,
      saltNonce
    );
  return { to, data, value: value ? value.toString() : 0 };
}

(async () => {
  const multisigOptions: GnosisMultisigOptions = {
    owners: ["0x...", "0x..."],
    threshold: 2,
    saltNonce: 0,
    gnosisSafeMaster: "...",
    proxyFactory: "...",
    fallbackHandler: "...",
  };
  // To calculate deterministic proxy address without actually deploying the proxy contract
  console.log(
    "Calculated multisig proxy account address: ",
    await calculateGnosisMultisigAddress(multisigOptions)
  );
  // To deploy proxy contract and effectivaly have gnosis multisig account
  const createMultisigTransactionData = await getCreateProxyTransaction(
    multisigOptions
  );
  const transaction = await createOreIdTransaction({
    chainNetwork: ChainNetwork.EthRopsten, // "eth_ropsten"
    transactionData: createMultisigTransactionData,
  });

  const { oreId } = getOreIdChainInfo(ChainNetwork.EthRopsten);
  await oreId.popup.sign({ transaction });
  process.exit();
})();
