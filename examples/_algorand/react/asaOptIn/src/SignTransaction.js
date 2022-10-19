import { useState } from "react";
import { ChainNetwork } from "oreid-js";
import { useOreId, useUser } from "oreid-react";


export const SignTransaction = () => {
    const oreId = useOreId();
    const user = useUser();
    const chainNetwork = ChainNetwork.AlgoTest;
    const[ txnId, setTxnId ] = useState("")
    const[ error, setError ] = useState("")

    const onError = ( error ) => {
        console.log("Transaction failed ", error);
        setError( error );
    };

    const onSuccess = ( result ) => {
        console.log( 
            "Transaction Successful. ", JSON.stringify(result)
        );
        setTxnId(result.transactionId);
    };

    const handleSign = async () => {
        const signingAccount = user.chainAccounts.find(
            (ca) => ca.chainNetwork ===  chainNetwork
        );
    
        const errorMsg = `User does not have any accounts on ${chainNetwork}`;
    
        if (!signingAccount) {
            onError( errorMsg )
            return;
        };

        // ASA Opt-in Transaction for USDC
        // 
        const transactionBody = {
            from: signingAccount.chainAccount,
            to: signingAccount.chainAccount,
            assetIndex: 10458941,
            amount: 0,
            type: "axfer"
        };

        const transaction = await oreId.createTransaction({
            chainAccount: signingAccount.chainAccount,
            chainNetwork: signingAccount.chainNetwork,
            transaction: transactionBody,
            signOptions: {
                broadcast: true,
                returnSignedTransaction: false,
            },
        });
        
        oreId.popup
            .sign({ transaction })
            .then( onSuccess )
            .catch( onError );
    };

    return(
        <div>
            <button
                onClick={() => {
                    handleSign()
                }}
            >
                Send Sample Transaction
            </button>

            {error && <div>Error: {error.message}</div>}
            {txnId && <div>Transaction Id: {txnId}</div>}
        </div>
    );
};