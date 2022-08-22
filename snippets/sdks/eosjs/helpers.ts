import { JsonRpc } from 'eosjs';
import { EosAuthorizationStruct } from './models';

const cleosRpcEndpoint = 'http://127.0.0.1:8888'
export const RPC = new JsonRpc(cleosRpcEndpoint); //required to read blockchain state


export function composeCreateAccountActions(
    creator: string,
    newAccountName: string,
    auths: { owner: EosAuthorizationStruct; active: EosAuthorizationStruct }
  ) {
    return [
      {
        account: "eosio",
        name: "newaccount",
        authorization: [
          {
            actor: creator,
            permission: "active",
          },
        ],
        data: {
          creator: creator,
          name: newAccountName,
          owner: auths.owner,
          active: auths.active,
        },
      },
      {
        account: "eosio",
        name: "buyrambytes",
        authorization: [
          {
            actor: creator,
            permission: "active",
          },
        ],
        data: {
          payer: creator,
          receiver: newAccountName,
          bytes: 8192,
        },
      },
      {
        account: "eosio",
        name: "delegatebw",
        authorization: [
          {
            actor: creator,
            permission: "active",
          },
        ],
        data: {
          from: creator,
          receiver: newAccountName,
          stake_net_quantity: "1.0000 SYS",
          stake_cpu_quantity: "1.0000 SYS",
          transfer: false,
        },
      },
    ];
  }