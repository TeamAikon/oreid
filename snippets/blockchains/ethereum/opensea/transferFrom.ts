import { ChainNetwork, WebWidgetSignResult } from "oreid-js"
import { useOreId, useUser } from "oreid-react"
import React from "react"

export const ethTransaction: React.FC = () => {
    const nftToOpensea = async () => {
        const oreId = useOreId()
        const userData = useUser()

        const ethChainType = ChainNetwork.EthGoerli

        const signingAccount = userData?.chainAccounts.find(
            (ca) => ca.chainNetwork === ethChainType
        )

        if (!signingAccount) {
            console.error(
                `User does not have any accounts on ${ethChainType}`
            )
            return
        }

        const abi = [
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
                outputs: [],
                stateMutability: 'nonpayable', 
                type: "function"
            }
        ];
        
        const contract = {
            abi: abi,
            method: "transferFrom",
            parameters: [
                "0x92B381515bd4851Faf3d33A161f7967FD87B1227",
                signingAccount.chainAccount,
                "728654"
            ]
        }

        const transactionAction = {
            to: "0xf4910c763ed447a585e2d34baa9a4b611ae448c",
            from: signingAccount?.chainAccount,
            contract: contract
        }

        const transaction = {actions: {}}
        transaction.actions = [transactionAction]

        const transactionToSign = await oreId.createTransaction({
            chainAccount: signingAccount.chainAccount,
            chainNetwork: signingAccount.chainNetwork,
            transaction: transaction,

        })
        console.log(transactionToSign)

        oreId.popup.sign(
            {
                transaction: transactionToSign
            }
        )
        .then((result: WebWidgetSignResult) => {
            console.log( `result: ${result}`);
            console.log( `txnid: ${result.transactionId}`)
        })

    }
    return (
        <div>
        <button onClick={() => nftToOpensea()} >
            NFTTOOPENSEA
        </button>
        </div>
    )
}