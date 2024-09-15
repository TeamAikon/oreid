import { Chain, ChainType, Models, PluginChainFactory } from "@open-rights-exchange/chain-js"
import { Plugin as EthPlugin } from "@open-rights-exchange/chain-js-plugin-ethereum"

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
    const chainInfo = ethGeorli.chainInfo
    console.log(chainInfo)
})();