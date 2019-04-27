import dotenv from 'dotenv';

dotenv.config();

const {
  REACT_APP_OREID_APP_ID: appId, // Provided when you register your app
  REACT_APP_OREID_API_KEY: apiKey, // Provided when you register your app
  REACT_APP_AUTH_CALLBACK: authCallbackUrl, // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_SIGN_CALLBACK: signCallbackUrl, // The url called by the server when transaction signing flow is finished - must match one of the callback strings listed in the App Registration
  REACT_APP_OREID_URL: oreIdUrl, // HTTPS Address of OREID server
  REACT_APP_BACKGROUND_COLOR: backgroundColor, // Background color shown during login flow
} = process.env;

class ENV {
  constructor() {
    this.appId = appId;
    this.apiKey = apiKey;
    this.authCallbackUrl = authCallbackUrl;
    this.signCallbackUrl = signCallbackUrl;
    this.oreIdUrl = oreIdUrl;
    this.backgroundColor = backgroundColor;
  }
}

const instance = new ENV();

export default instance;
