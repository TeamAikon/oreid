import { ChainFactory, ChainType, HelpersEos } from "@open-rights-exchange/chainjs"
import { EosTransaction } from "@open-rights-exchange/chainjs/dist/chains/eos_2"
import { serialize, ObjectSchema } from "atomicassets"
import dotenv from 'dotenv';
import { aikonNftAuthor, aikonNftAuthorPublicKeys, aikonNftauthorPrivateKeys, aikonNftauthorActivePubKey, aikonNftauthorActivePrivKey, aikonCollectionName, aikonSchemaName, aikonTemplateId  } from '../constants';

dotenv.config();
const PORT = process.env.PORT || process.env.REACT_APP_PORT

// WAX Network Endpoints
const rpcEndpoints: [{url: string}] = [
    { url: 'https://wax-test.blokcrafters.io' }
]

export async function mintNft(templateId?: string, newOwnerAccount?: string, userName?: string ) {

  if(!templateId || templateId === 'undefined') {
    templateId = aikonTemplateId
  }

  if (templateId !== aikonTemplateId) {
    throw new Error(`You cannot mint that NFT templateId:${templateId}`)
  }

  // this schema is used for serialisation / deserializatio
  const schema = ObjectSchema([
      {"name": "name", "type": "string"}, 
      {"name": "img", "type": "ipfs"}, 
      {"name": "back img", "type": "string"}, 
      {"name": "video", "type": "ipfs"},
      {"name": "card num", "type": "uint64"}, 
      {"name": "stake-able", "type": "bool"}, 
      {"name": "stake power", "type": "double"}, 
  ]);

  const welcomeString = 'Welcome' + (userName ? `, ${toCapitalCase(userName)}` : '')
  const ownerString = newOwnerAccount ? ` (OreID: ${newOwnerAccount})` : ``

  const nftName = `${welcomeString}${ownerString}`

  const rawObject = {
      "name": nftName,
      "img": "QmcHzGWoXSUV3WDekYjkVhgg9H66TGGpKXb3u8AwxubenN",
      "back img": "https://boxycoinnfts.mypinata.cloud/ipfs/QmV2vCzxzm6TiL68LBUd3yjhe68KEtDow53eXathX18KLq",
      "video": "QmSdezrRqxdkvG7eLLjY7iPznsVt5zsqkJ1BrBQgPBsLhS",
      "card num": 1,
      "stake-able": true,
      "stake power": 16.25
  }

  // const immutableData = [
  //   {
  //     'key': 'name',
  //     'value': ["string", nftName]
  //   },
  //   {
  //     'key': 'img',
  //     'value': ['string', "QmcHzGWoXSUV3WDekYjkVhgg9H66TGGpKXb3u8AwxubenN"]
  //   }
  // ]

  console.log(rawObject)

  if(!newOwnerAccount) newOwnerAccount = aikonNftAuthor

  // serialize Immutable Data
  const serializedDataImmut = serialize(rawObject, schema)
  // console.log(serializedDataImmut)

  // // Serialize Mutable Data
  const serializedDataMute = serialize({}, ObjectSchema([]))
  // console.log(serializedDataMute)

  const tokens_backed: [] = []

  // create mintasset transaction
  const action = {
      account: HelpersEos.toEosEntityName('atomicassets'),
      name: 'mintasset',
      authorization: [{
          actor: HelpersEos.toEosEntityName(aikonNftAuthor),
          permission: HelpersEos.toEosEntityName('active'),
      }],
      data: {
          authorized_minter: aikonNftAuthor,
          collection_name: aikonCollectionName,
          schema_name: aikonSchemaName,
          template_id: templateId,
          new_asset_owner: newOwnerAccount,
          immutable_data: serializedDataMute,
          mutable_data: serializedDataMute,
          tokens_to_back: tokens_backed
      }
  }


  // const api = new ExplorerApi("https://test.wax.api.atomicassets.io", "atomicassets", {fetch});
  // const actions = (await api.action).mintasset(
  //   [{actor: "pinknetworkx", permission: "active"}],
  //   "collection", "scheme", -1, "pinknetworkx", {"name": "test"}, {"species": "test2"}
  // )

  // const chainSettings = {
  //     unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  // }

  const chainSettings = {
    unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  }

  const chain = new ChainFactory().create( ChainType.EosV2 , rpcEndpoints, chainSettings )

  console.log("before chain.connect")
  await chain.connect()
  console.log("after chain.connect")
  const transaction: EosTransaction = (await chain.new.Transaction()) as EosTransaction

  if (transaction) {
      console.log("Setting Transaction Actions..")
      transaction.actions = [action]
      console.log("transaction actions: " + JSON.stringify(transaction))

      console.log("Preparing to be signed...")
      await transaction.prepareToBeSigned()
      console.log("prepared Transaction: " + JSON.stringify(transaction))

      console.log("Validating Transaction...")
      await transaction.validate()
      console.log("validated transaction: " + JSON.stringify(transaction))

      console.log("signing transaction with private key...")
      await transaction.sign([aikonNftauthorActivePrivKey])
      if (transaction.missingSignatures) { 
          console.error('missing sigs: ' + JSON.stringify(transaction.missingSignatures))
      }

      const txResponse = await transaction.send()
      console.log('txResponse:', txResponse)
      const status = "Txn Id: " + txResponse.transactionId
      console.log(status)
      return { transactionId: txResponse.transactionId }
  }
}

// Uppercase first character of string
export function toCapitalCase(value: any): string {
  if(!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export function isANumber(value: any) {
  if (!value || Number.isNaN(value)) return false
  return typeof value === 'number' || value instanceof Number
}

// export function convertJsonSerialization(value: any) {
//   // Convert number array to UInt8Array e.g. {"0":2,"1":209,"2":8 ...}
//   if (value !== null && typeof value === 'object' && !Array.isArray(value) && '0' in value && isANumber(value['0'])) {
//     const values = Object.entries(value).map(([, val]) => val)
//     console.log('got values:', values)
//     // if array only has 8-bit numbers, convert it to UInt8Array
//     if (values.every(val => isANumber(val) || val as number < 256)) {
//       console.log('before values convert')
//       return new Uint8Array(values as number[])
//     }
//   }
// }

// function toAttributeMap(obj, schema) {
//   const types = {};
//   const result = [];
//   for (const row of schema) {
//       types[row.name] = row.type;
//   }
//   const keys = Object.keys(obj);
//   for (const key of keys) {
//       if (typeof types[key] !== 'undefined') {
//           throw new SerializationError_1.default('field not defined in schema');
//       }
//       result.push({ key, value: [types[key], obj[key]] });
//   }
//   return result;
// }