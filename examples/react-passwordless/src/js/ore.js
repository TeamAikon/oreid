import { OreId } from 'eos-auth';
import ENV from './env';

export default class ORE {
  constructor() {
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
      setBusyCallback,
    });
  }

  isBusy() {
    return this.busyFlag;
  }
}
