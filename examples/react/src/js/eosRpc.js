const { JsonRpc } = require('eosjs');

export default class EOSRpc {
  constructor(server) {
    this.rpc = new JsonRpc(server);
  }

  async getRows(contract, scope, table) {
    const resp = await this.rpc.get_table_rows({
      json: true,
      code: contract,
      scope,
      table,
    });

    return resp;
  }

  async getInfo() {
    const resp = await this.rpc.get_info();

    return resp;
  }

  async getAccount(accountName) {
    let resp = {};

    if (accountName && accountName.length > 0) {
      resp = await this.rpc.get_account(accountName);
    }

    return resp;
  }
}
