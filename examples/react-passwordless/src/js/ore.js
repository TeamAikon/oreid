import { OreId } from 'eos-auth';
import ENV from './env';

export default class ORE {
  constructor() {
    this.v_busyFlag = false;
    this.v_isLoggedIn = false;
    this.v_userInfo = {};
    this.v_waitingForLocalStateLogin = false;

    const setBusyCallback = (isBusy) => {
      console.log('busy: ', isBusy);
      this.v_busyFlag = isBusy;
    };

    this.v_oreid = new OreId({
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
    return this.v_busyFlag;
  }

  isLoggedIn() {
    return this.v_isLoggedIn;
  }

  userInfo() {
    return this.v_userInfo;
  }

  // pass nothing to clear and set loggedIn state to false
  setUserInfo(info = null) {
    if (info) {
      this.v_isLoggedIn = true;
      this.v_userInfo = info;
    } else {
      this.v_isLoggedIn = false;
      this.v_userInfo = {};
    }
  }

  // called on page load to get the user info from ORE ID
  async loadUserFromLocalState() {
    this.v_waitingForLocalStateLogin = true;

    const info = await this.v_oreid.getUser();

    if (info && info.accountName) {
      this.setUserInfo(info);
    }

    this.v_waitingForLocalStateLogin = false;
  }

  waitingForLogin() {
    return this.v_waitingForLocalStateLogin;
  }

  async handleAuthCallback() {
    const url = window.location.href;
    if (/authcallback/i.test(url)) {
      const { account, errors } = await this.v_oreid.handleAuthResponse(url);
      if (!errors) {
        this.loadUserFromApi(account);
      } else {
        this.displayResults(errors);
      }
    }
  }

  displayResults(results) {
    console.log(results);
  }

  async login(args) {
    try {
      return this.v_oreid.login(args, ENV.chainNetwork);
    } catch (error) {
      this.displayResults(error);

      return null;
    }
  }

  logout() {
    this.displayResults();

    this.setUserInfo();

    // clears local user state (stored in local storage or cookie)
    this.v_oreid.logout();
  }

  async loadUserFromApi(account) {
    try {
      const info = await this.v_oreid.getUserInfoFromApi(account);
      this.setUserInfo(info);
    } catch (error) {
      this.displayResults(error);
    }
  }

  async passwordlessSendCode(args) {
    const result = await this.v_oreid.passwordlessSendCodeApi(args);

    this.displayResults(result);

    return result;
  }

  async passwordlessVerifyCode(args) {
    const result = await this.v_oreid.passwordlessVerifyCodeApi(args);

    this.displayResults(result);

    return result;
  }
}
