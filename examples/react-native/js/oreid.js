import { OreId } from 'eos-auth';

const settings = require('../env.js');

const {
  OREID_APP_ID: appId, // Provided when you register your app
  OREID_API_KEY: apiKey, // Provided when you register your app
  OREID_URL: oreIdUrl, // HTTPS Address of OREID server - refer to .env.example.json
  BACKGROUND_COLOR: backgroundColor // Background color shown during login flow
} = settings;

class Ore {
  constructor() {
    this.oreId = new OreId({ appId, apiKey, oreIdUrl });
  }

  async getOreIdAuthUrl(provider) {
    const callbackUrl = 'https://callback.sampleapp.com';

    // getOreIdAuthUrl returns a fully formed url that you can redirect a user's browser to to start the OAuth login flow
    return this.oreId.getOreIdAuthUrl({ provider, callbackUrl, backgroundColor });
  }

  async getUserInfoFromApi(account) {
    return this.oreId.getUserInfoFromApi(account);
  }
}

const instance = new Ore();

export default instance;
