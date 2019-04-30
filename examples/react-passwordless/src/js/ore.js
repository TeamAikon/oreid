import { OreId } from 'eos-auth';
import ENV from './env';

export default class ORE {
  constructor(model) {
    this.v_busyFlag = false;
    this.v_waitingForLocalStateLogin = false;
    this.v_model = model;

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

  // pass nothing to clear and set loggedIn state to false
  setUserInfo(info = null) {
    if (info) {
      this.v_model.isLoggedIn = true;
      this.v_model.userInfo = info;
    } else {
      this.v_model.isLoggedIn = false;
      this.v_model.userInfo = {};
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
    if (results) {
      this.v_model.results = JSON.stringify(results, null, '  ');
    } else {
      this.v_model.results = '';
    }
  }

  async login(args) {
    this.displayResults();

    try {
      const result = this.v_oreid.login(args, ENV.chainNetwork);

      this.displayResults(result);

      return result;
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
    this.displayResults();

    try {
      const info = await this.v_oreid.getUserInfoFromApi(account);
      this.setUserInfo(info);

      this.displayResults(info);
    } catch (error) {
      this.displayResults(error);
    }
  }

  async passwordlessSendCode(args) {
    this.displayResults();

    const result = await this.v_oreid.passwordlessSendCodeApi(args);

    this.displayResults(result);

    return result;
  }

  async passwordlessVerifyCode(args) {
    this.displayResults();

    const result = await this.v_oreid.passwordlessVerifyCodeApi(args);

    this.displayResults(result);

    return result;
  }
}
