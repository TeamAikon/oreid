import dotenv from 'dotenv';
dotenv.config();

// NFT Author and minting keys
export const aikonNftAuthor: string = "testsataikon"
export const aikonNftAuthorPublicKeys: string [] = [ process.env.REACT_APP_NFT_PUBLIC_KEY1 as string, process.env.REACT_APP_NFT_PUBLIC_KEY2 as string ]
export const aikonNftauthorPrivateKeys: string [] = [ process.env.REACT_APP_NFT_PRIVATE_KEY1 as string, process.env.REACT_APP_NFT_PRIVATE_KEY2 as string ]
export const aikonNftauthorActivePubKey = aikonNftAuthorPublicKeys[0] as any
export const aikonNftauthorActivePrivKey = aikonNftauthorPrivateKeys[0] as any

// NFT asset to mint
export const aikonCollectionName: string = "orenetworkv1"
export const aikonSchemaName: string = "welcometoore"
export const aikonTemplateId: string = "417168"
