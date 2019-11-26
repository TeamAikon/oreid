import { Api, JsonRpc } from 'eosjs';
import ecc from 'eosjs-ecc';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { fetch } from 'node-fetch';
const signatureProvider = new JsSignatureProvider([]);
// const { TextEncoder, TextDecoder } = require('util');

export async function initAPI(url) {
  let rpc = await new JsonRpc(url, { fetch });
  let api = await new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });
  return api;
}

export async function serializeTransaction(transaction, api) {
  return await api.transact(transaction, { blocksBehind: 10, expireSeconds: 60, broadcast: false, sign: false });
}

export async function createBuffer(serializedTransaction, api) {
  const { chainId } = api;
  return Buffer.concat([
    new Buffer(chainId, 'hex'),
    new Buffer(serializedTransaction),
    new Buffer(new Uint8Array(32))
  ]);
}

export async function signTransaction(transaction, url, privateKey) {
  let signedTransaction = {};
  const api = await initAPI(url);
  const { serializedTransaction } = await serializeTransaction(transaction, api);
  signedTransaction.serializedTransaction = serializedTransaction;
  console.log(signedTransaction.serializedTransaction);
  const buffer = await createBuffer(signedTransaction.serializedTransaction, api);
  signedTransaction.signatures = [ecc.Signature.sign(buffer, privateKey).toString()];
  return signedTransaction;
}