import { Chain, ChainType, Models, PluginChainFactory, Transaction } from "@open-rights-exchange/chain-js"
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
        "0x5d40e837410170f912dd07db914e0534c539d8c6",
        "0x92B381515bd4851Faf3d33A161f7967FD87B1227",
        "4379987862034297058192663948417605894473"
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

    const transaction: Transaction = await ethGeorli.new.Transaction({
        MaxFeeIncreasePercentage: 200
    })

    const transactionAction: ModelsEthereum.EthereumTransactionAction = {
        to: HelpersEthereum.toEthereumAddress("0xE07C99e940FA19280368E80A612EEDBB0665B68C"), // ERC-721 Contract address
        from: HelpersEthereum.toEthereumAddress("0x5d40e837410170f912dd07db914e0534c539d8c6"), // Signer's Public Key
        contract: contract
    }

    transaction.actions = [transactionAction]
    console.log("actions" + JSON.stringify((transaction.actions)))
    await transaction.prepareToBeSigned()
    await transaction.validate()
    await transaction.getSuggestedFee(Models.TxExecutionPriority.Average)
    console.log(transaction)
})();