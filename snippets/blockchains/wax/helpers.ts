import * as waxjs from "@waxio/waxjs/dist"

export const wax = (
    account: string,
    pubKeys: string[],
) => {
    return new waxjs.WaxJS({
        rpcEndpoint: 'https://wax.greymass.com',
        userAccount: account,
        pubKeys: pubKeys,
    });
}
