import dotenv from 'dotenv';
dotenv.config();

//Load settings
const { AUTH_CALLBACK, SIGN_CALLBACK, BACKGROUND_COLOR } = process.env;

//redirect browser to OAuth flow
export function loginHandler(oreId) {
  return asyncHandler(async function(req, res, next) {
    const provider = req.params.logintype;
    let authUrl = await oreId.getOreIdAuthUrl({ provider, callbackUrl: AUTH_CALLBACK, signCallbackUrl: SIGN_CALLBACK, backgroundColor: BACKGROUND_COLOR });
    //redirect browser
    res.redirect(authUrl);
  });
}

//display user state
export function displayUser() {
  return function(req, res, next) {
    const { user } = req;
    if (user) {
      return res.status(200).json(user);
    }
  };
}

export function helpPrompt() {
  return function(req, res, next) {
    let message = 'Start login flow using /login route. Try it like this: {http://yourserver:port}/login/facebook';
    return res.status(200).send(message);
  };
}

//Generic async handler for Express Middleware
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
