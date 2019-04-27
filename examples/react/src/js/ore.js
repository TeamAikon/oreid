import { OreId } from 'eos-auth';
import scatterProvider from 'eos-transit-scatter-provider';
import ledgerProvider from 'eos-transit-ledger-provider';
import lynxProvider from 'eos-transit-lynx-provider';
import meetoneProvider from 'eos-transit-meetone-provider';
import tokenpocketProvider from 'eos-transit-tokenpocket-provider';
import ENV from './env';

export default class ORE {
  constructor() {
    const eosTransitWalletProviders = [
      scatterProvider(),
      // ledgerProvider(),
      ledgerProvider({ pathIndexList: [0, 1, 2, 35] }),
      lynxProvider(),
      meetoneProvider(),
      tokenpocketProvider(),
    ];

    this.busyFlag = false;
    const setBusyCallback = (isBusy) => {
      this.busyFlag = isBusy;
    };

    this.id = new OreId({
      appName: 'ORE ID Sample App',
      appId: ENV.appId,
      apiKey: ENV.apiKey,
      oreIdUrl: ENV.oreIdUrl,
      authCallbackUrl: ENV.authCallbackUrl,
      signCallbackUrl: ENV.signCallbackUrl,
      backgroundColor: ENV.backgroundColor,
      eosTransitWalletProviders,
      setBusyCallback,
    });
  }

  isBusy() {
    return this.busyFlag;
  }
}
