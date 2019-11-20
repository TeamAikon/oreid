import { Api, JsonRpc } from 'eosjs';
import ecc from 'eosjs-ecc';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
const signatureProvider = new JsSignatureProvider([]);

export function initAPI(url) {
  let rpc = new JsonRpc(url, { fetch });
  let api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  return api;
}

export async function serializeTransaction(action, api) {
  let transaction = {};
  transaction.actions = [action];
  return await api.transact(transaction, { blocksBehind: 3, expireSeconds: 30, broadcast: false, sign: false });
}

export async function createBuffer(serializedTransaction, api) {
  const { chainId } = api;
  return Buffer.concat([
    new Buffer(chainId, 'hex'),
    new Buffer(serializedTransaction.serializedTransaction),
    new Buffer(new Uint8Array(32))
  ]);
}

export async function signTransaction(transaction, url, privateKey) {
  const api = await initAPI(url);
  const serializedTrx = await serializeTransaction(transaction, api);
  const buffer = await createBuffer(serializedTrx, api);
  return ecc.Signature.sign(buffer, privateKey).toString();
}