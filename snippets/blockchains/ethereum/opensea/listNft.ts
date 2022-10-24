import { Chain, ChainType, Helpers, Models, PluginChainFactory, Transaction } from "@open-rights-exchange/chain-js"
import { Plugin as EthPlugin, ModelsEthereum, HelpersEthereum } from "@open-rights-exchange/chain-js-plugin-ethereum"

const abi: ModelsEthereum.EthereumAbi = [
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: "transferFrom",
        type: "function"
    }
];

const contract: ModelsEthereum.EthereumActionContract = {
    abi: abi,
    method: "transferFrom",
    parameters: [
        "0x92B381515bd4851Faf3d33A161f7967FD87B1227",
        "0xf4910c763ed4e47a585e2d34baa9a4b611ae448c",
        "728654"
    ]
}
const endpoints: Models.ChainEndpoint = {
    url: "https://rpc.ankr.com/eth_goerli",
};

const chainSettings: Models.ChainSettings = {
    chainName: "georli",
    hardFork: "prater"
};

( async () => {
    const ethGeorli: Chain = PluginChainFactory(
        [EthPlugin],
        ChainType.EthereumV1,
        [endpoints],
        chainSettings
    );

    await ethGeorli.connect()
    console.log(ethGeorli.chainInfo)
    console.log(contract)

    const transaction: Transaction = await ethGeorli.new.Transaction()

    const transactionAction: ModelsEthereum.EthereumTransactionAction = {
        to: HelpersEthereum.toEthereumAddress("0xf4910c763ed4e47a585e2d34baa9a4b611ae448c"),
        // from: HelpersEthereum.toEthereumAddress("0x92B381515bd4851Faf3d33A161f7967FD87B1227"),
        contract: contract
    }

    transaction.actions = [transactionAction]
    console.log("actions" + JSON.stringify((transaction.actions)))

    
})();