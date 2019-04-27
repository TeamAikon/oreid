import { OreId } from 'eos-auth';

const OREID_APP_ID = 'demo_0097ed83e0a54e679ca46d082ee0e33a';
const OREID_API_KEY = 'demo_k_97b33a2f8c984fb5b119567ca19e4a49';
const OREID_URL = 'https://staging.oreid.io';

export default class ORE {
  constructor() {
    this.busyFlag = false;
    const setBusyCallback = (isBusy) => {
      this.busyFlag = isBusy;
    };

    this.id = new OreId({
      appName: 'ORE ID Sample App',
      appId: OREID_APP_ID,
      apiKey: OREID_API_KEY,
      oreIdUrl: OREID_URL,
      setBusyCallback: setBusyCallback,
    });
  }

  isBusy() {
    return this.busyFlag;
  }
}
