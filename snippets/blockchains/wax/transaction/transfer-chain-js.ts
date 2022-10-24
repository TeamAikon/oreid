import { ChainType, PluginChainFactory, Helpers, Models, Crypto, Chain, Transaction } from "@open-rights-exchange/chain-js"
import { Plugin as EosPlugin, HelpersEos, ModelsEos } from "@open-rights-exchange/chain-js-plugin-eos"

const key = {
    account: "jamesataikon",
    publicKey: "EOS5CKWvdorgzsqGBkSWimGKMWtfaXKg52f2b6CaemdGyC4YcUujs",
    privateKey: "5JPHDdgM9y8TkKLVzZwAYaB6qR7iKfhQqYDc6uaRzb6f1poZzyg"
}

const endpoints: Models.ChainEndpoint = {
    // url: 'https://wax.greymass.com'
    url: "https://wax-test.blokcrafters.io"
};

const chainSettings: Models.ChainSettings = {
    unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
  }

const action = (
    from: string,
    quantity: string
): ModelsEos.EosActionStruct => {
    return {
        account: HelpersEos.toEosEntityName("eosio.token"),
        name: 'transfer',
        authorization: [{
            actor: HelpersEos.toEosEntityName(from),
            permission: HelpersEos.toEosEntityName("active")
        }],
        data: {
            from: from,
            to: "testsataikon",
            quantity: quantity,
            memo: "ChainJs Test Txn"
        }
    }
}


( async () => {
    const wax: Chain = PluginChainFactory(
        [EosPlugin],
        ChainType.EosV2,
        [endpoints],
        chainSettings
    );

    await wax.connect()
    console.log(wax.chainInfo)

    const transaction: Transaction = await wax.new.Transaction(
        { blocksBehind: 10 }
    )
    const transferAction: ModelsEos.EosActionStruct[] = [
        action(
            key.account,
            "0.00000001 WAX"
        )
    ]
    transaction.actions = transferAction
    // transaction.addAction(transferAction, true)

    console.log("actions" + JSON.stringify(transaction.actions))
    
    try {
        await transaction.prepareToBeSigned()
        await transaction.validate()
        await transaction.sign([HelpersEos.toEosPrivateKey(key.privateKey)])
        console.log("missing sigs" + transaction.missingSignatures)

        const txResponse: Models.TransactionChainResponse = await transaction.send()
        console.log(txResponse)
    }
    catch (err) {
        console.log(JSON.stringify(err))
    }
    

})();