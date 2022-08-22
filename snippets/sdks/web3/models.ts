export type GnosisMultisigOptions = {
  owners: string[];
  threshold: number;
  saltNonce: number;
  gnosisSafeMaster?: string;
  proxyFactory?: string;
  fallbackHandler?: string;
  initializerAction?: GnosisInitializerAction;
};

export type GnosisInitializerAction = {
  initializerTo?: string;
  initializerData?: string;
  paymentToken?: string;
  paymentAmount?: number;
  paymentReceiver?: string;
};

/** Derived from web3-core types, used to estimateGas */ 
export interface TransactionConfig {
  from?: string | number;
  to?: string;
  value?: number | string;
  gas?: number | string;
  gasPrice?: number | string;
  data?: string;
  nonce?: number;
  chainId?: number;
  chain?: string;
  hardfork?: string;
}