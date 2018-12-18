import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

let API_KEY = process.env.REACT_APP_API_KEY;                    // Provided when you register your app
let CALLBACK = process.env.REACT_APP_CALLBACK;                  // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
let OREID_URI = process.env.REACT_APP_OREID_URI;                // HTTPS Address of OREID server
let BACKGROUND_COLOR = process.env.REACT_APP_BACKGROUND_COLOR;  // Background color shown during login flow

/*
  Returns a fully formed url that you can redirect a user's browser to to start the OAuth login flow
  This function internally calls the ORE ID /app-token API endpoint to get an app_access_token that is required when calling the OAuth login flow
  ...the app app_access_token has your appId in it. It lets the ORE ID web app which app the user is logging-into
*/
export async function getOreIDUrl(loginType) {
    const response = await fetch(`${OREID_URI}/api/app-token`, {
      headers: {
        'api-key' : API_KEY
      }
    });

    const { appAccessToken } = await response.json();
    return `${OREID_URI}/auth#app_access_token=${appAccessToken}?provider=${loginType}?callback_url=${encodeURIComponent(CALLBACK)}?background_color=${BACKGROUND_COLOR}`;
}

/*
  Get the user info from ORE ID for the given user account
*/
export async function getUserInfo(account) {
  const userUrl =`${OREID_URI}/api/user?account=${account}`;
  const response = await fetch(userUrl, {
    headers: {
      'api-key' : API_KEY
    }
  });
  return await response.json();
}
