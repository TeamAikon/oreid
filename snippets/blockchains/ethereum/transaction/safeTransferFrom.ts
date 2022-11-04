/*
ERC-1155 safeTransferFrom Transaction Data

Note: This snippet is passed as <transactionData>
      into the oreId.createTransaction() function.

      oreId.createTransaction({
        account: oreId.auth.user.data.accountName,
        chainAccount: chainAccountData?.chainAccount,
        chainNetwork: chainNetwork,
        transaction: { actions: transactionData } as any,
        signOptions: { broadcast: true },
      });

      <chainAccountData.chainAccount> is the signer's 
      public address/key for the transaction.
      
      <chainNetwork> is the network/blockchain that the
      transaction will take place on.

Date: November 3, 2022
*/
const erc1155Abi: any[] = [
    {
        "inputs":
        [
            {
                "internalType": "address",
                "name": "_from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "_data",
                "type": "bytes"
            }
        ],
        "name": "safeTransferFrom",
        "outputs":
        [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
  ]

  let b : any = []
  var erc1155_Contract_Address = "0xf4910c763ed4e47a585e2d34baa9a4b611ae448c";
  var nft_recipient_Address = "0x60d5DA4FC785Dd1dA9c2dAF084B2D5ba478c8f8b";
  var tokenId = "43799878620342970581926639484176058944731643284697752016825318575943809236993";

  const transaction = 
  {
    "from": actor,
    "to": erc1155_Contract_Address,
    "contract":
    {
        "abi": erc1155Abi,
        "method": "safeTransferFrom",
        "parameters":
        [
            actor,
            nft_recipient_Address,
            tokenId,
            1,
            b
        ]
    }
  };