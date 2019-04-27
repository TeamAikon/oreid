import { decorate, observable, action } from 'mobx';

export default class Model {
  constructor() {
    this.userInfo = [];

    this.isLoggedIn = false;

    this.errorMessage = '';

    this.signedTransaction = null;

    this.signState = null;
  }

  clearErrors() {
    this.errorMessage = null;
    this.signedTransaction = null;
    this.signState = null;
  }
}

decorate(Model, {
  userInfo: observable,
  isLoggedIn: observable,
  errorMessage: observable,
  signedTransaction: observable,
  signState: observable,
  clearErrors: action,
});
