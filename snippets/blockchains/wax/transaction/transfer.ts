import { TransactionBuilder } from "eosjs/dist/eosjs-api";
import { TransactConfig, Transaction } from "eosjs/dist/eosjs-api-interfaces";
import { stringToPrivateKey } from "eosjs/dist/eosjs-numeric";
import { wax } from "../helpers"


const key = {
    account: "jamesataikon",
    publicKey: "EOS5CKWvdorgzsqGBkSWimGKMWtfaXKg52f2b6CaemdGyC4YcUujs",
    privateKey: "5JPHDdgM9y8TkKLVzZwAYaB6qR7iKfhQqYDc6uaRzb6f1poZzyg"
}

const composeTransferTransaction = (
    from: string,
    to: string,
    quantity: string
): Transaction => {
    return {
        actions: [{
            account: "eosio.token",
            name: "transfer",
            authorization: [{
                actor: from,
                permission: "active"
            }],
            data: {
                from: from,
                to: to,
                quantity: quantity,
                memo: "WaxJs Test Txn"
            }
        }]
    }
};

const composeTransactConfig = (
    blocksBehind: number,
    keys: string[],
): TransactConfig => {
    return {
        broadcast: true,
        sign: true,
        requiredKeys: keys,
        blocksBehind: blocksBehind
    }
}

(async () => {
    const wax1 = wax(key.account, [key.publicKey])
    const transactionConfig = composeTransactConfig(
        3,
        [key.privateKey]
    )
    const transaction = composeTransferTransaction(
        key.account,
        "testsataikon",
        "0.00000001 WAX"
    )

    
    const transactionResult =  await wax1.api.transact(
            transaction,
            transactionConfig
        )
    console.log(transactionResult)
})()