/** EOS Raw Data Structure for Authorization - i.e. account, permissions, and weights */
export type EosAuthorizationStruct = {
  threshold: number;
  accounts: {
    permission: {
      actor: string;
      permission: string;
    };
    weight: number;
  }[];
  keys: {
    key: string;
    weight: number;
  }[];
  waits: {
    wait_sec: number;
    weight: number;
  }[];
};
