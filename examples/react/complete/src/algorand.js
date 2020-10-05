/** Send 1 microAlgos from the user's account to some other account */
export async function composeAlgorandSampleTransaction(userAccount, toAddress) {
  return {
    from: userAccount,
    to: toAddress,
    amount: 1,
    note: 'transfer memo',
    fee: 1000,
    type: 'pay',
    firstRound: 9468939, // this value must be updated with current chain info
    lastRound: 9469939, // this value must be updated with current chain info
    genesisID: 'testnet-v1.0',
    genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
  };
}
