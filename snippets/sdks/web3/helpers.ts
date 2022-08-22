import Web3 from "web3";
import { Contract, ContractInterface, ethers } from "ethers";
import GnosisSafeSol from "@gnosis.pm/safe-contracts/build/artifacts/contracts/GnosisSafe.sol/GnosisSafe.json";
import ProxyFactorySol from "@gnosis.pm/safe-contracts/build/artifacts/contracts/proxies/GnosisSafeProxyFactory.sol/GnosisSafeProxyFactory.json";
import { GnosisInitializerAction, GnosisMultisigOptions } from "./models";

export const ZERO_HEX = "0x00";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const EMPTY_DATA = "0x";
export const SENTINEL_ADDRESS = "0x0000000000000000000000000000000000000001";
export const EMPTY_HEX = "0x";

const WEB3_ENDPOINT = "http://localhost:8545";

export const web3 = new Web3(WEB3_ENDPOINT);

export const ethersJsonRpc = new ethers.providers.JsonRpcProvider(
  WEB3_ENDPOINT
);

export function getGnosisSafeContract(address: string): Contract {
  return new Contract(
    address,
    GnosisSafeSol.abi as ContractInterface,
    ethersJsonRpc
  );
}

export function getProxyFactoryEthersContract(address: string): Contract {
  return new Contract(
    address,
    ProxyFactorySol.abi as ContractInterface,
    ethersJsonRpc
  );
}

export async function getCreateProxyInitializerData(
  multisigOptions: GnosisMultisigOptions
) {
  const {
    gnosisSafeMaster,
    fallbackHandler,
    initializerAction,
    threshold,
    owners,
  } = multisigOptions;
  const gnosisSafeMasterContract = getGnosisSafeContract(gnosisSafeMaster);
  const {
    initializerTo,
    initializerData,
    paymentToken,
    paymentAmount,
    paymentReceiver,
  } = setupInitilaizerAction(initializerAction);
  const sortedAddrs = sortHexStrings(owners);
  const { data } = await gnosisSafeMasterContract.populateTransaction.setup(
    sortedAddrs,
    threshold,
    initializerTo,
    initializerData,
    fallbackHandler,
    paymentToken,
    paymentAmount,
    paymentReceiver
  );
  return data;
}

export function setupInitilaizerAction(
  initializerAction?: GnosisInitializerAction
) {
  const {
    initializerTo,
    initializerData,
    paymentToken,
    paymentAmount,
    paymentReceiver,
  } = initializerAction || {};
  return {
    initializerTo: initializerTo || SENTINEL_ADDRESS,
    initializerData: initializerData || EMPTY_DATA,
    paymentToken: paymentToken || SENTINEL_ADDRESS,
    paymentAmount: paymentAmount || 0,
    paymentReceiver: paymentReceiver || SENTINEL_ADDRESS,
  };
}

export function sortHexStrings(hexArray: string[]) {
  hexArray?.sort((left, right) =>
    left?.toLowerCase().localeCompare(right?.toLowerCase())
  );
  return hexArray;
}