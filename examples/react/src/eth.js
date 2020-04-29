const Web3 = require('web3') 
const Tx = require('ethereumjs-tx').Transaction
const { toBuffer } = require('ethereumjs-util')
const { ETH_CHAIN_NETWORK } = require('./constants')

export const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'subtractedValue',
        type: 'uint256',
      },
    ],
    name: 'decreaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'addedValue',
        type: 'uint256',
      },
    ],
    name: 'increaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

function toHex(value, web3){
  return web3.utils.toHex(value)
}

function getEthChainName(chainNetwork){
  try{
    return chainNetwork.split('_')[1]
  } catch(error){
    throw new Error('Error getting ethereum chain name from ' + chainNetwork)
  }
}

export async function init(url){
  const web3 = new Web3(url)
  return web3
}

async function signAndSerializeTransaction(rawTx, privateKey){
  privateKey = toBuffer(privateKey);
  const chainName = getEthChainName(ETH_CHAIN_NETWORK)
  const tx =  new Tx(rawTx, {chain:chainName});
  tx.sign(privateKey)
  const serializedTx = tx.serialize();
  return serializedTx
}

async function sendSignedTransaction(transaction, web3){
  return new Promise((resolve, reject) => {
    web3.eth.sendSignedTransaction('0x' + transaction.toString('hex'))
      .on('receipt', receipt => {
        resolve(receipt)
      })
      .on('error', err => {
        reject(err)
      })
    })
}

export async function getGasParams(from, web3){
  const gasPrice = await web3.eth.getGasPrice()
  const { gasLimit } = await web3.eth.getBlock('latest')
  const nonce = await web3.eth.getTransactionCount(from, 'pending')
  return { gasPrice, gasLimit, nonce }
}

export  async function transferErc20Token(contractAddress, from, to, value, privateKey, web3, setBusyCallback){
  setBusyCallback(true, `transferring Erc20 token to address:${to}.`)
  const { gasPrice, gasLimit, nonce } = await getGasParams(from, web3)
  const erc20 = new web3.eth.Contract(ABI, contractAddress)
  const rawTx = {
    nonce: toHex(nonce, web3),
    gasPrice: toHex(gasPrice,web3),
    gasLimit: toHex(gasLimit,web3),
    from,
    to: contractAddress,
    data: erc20.methods.transfer(to, value).encodeABI()
  }
  privateKey = '0x' + privateKey.toString('hex');
  const transaction =  await signAndSerializeTransaction(rawTx, privateKey);
  const result = await sendSignedTransaction(transaction, web3);
  setBusyCallback(false)
  return result;
}

// value in ether
export async function addEthForGas(from, to, value, privateKey, web3, setBusyCallback){
  setBusyCallback(true, `first adding Eth to address: ${to} (for gas) so transation can execute. ----> NOTICE: This could take up to 15mins to confirm - you can wait or come back later`)
  const { gasPrice, gasLimit, nonce } = await getGasParams(from, web3)
  value = web3.utils.toWei(value,'ether') 
  const rawTx = {
    nonce: toHex(nonce, web3),
    gasPrice: toHex(gasPrice + 20,web3),
    gasLimit: toHex(gasLimit,web3),
    from,
    to,
    value: toHex(value,web3)
  }
  privateKey = '0x' + privateKey.toString('hex');
  const transaction = await signAndSerializeTransaction(rawTx, privateKey)
  const result = await sendSignedTransaction(transaction, web3)
  setBusyCallback(false)
  return result;
}

export async function getEthBalance(address, web3, setBusyCallback){
  setBusyCallback(true, `checking Eth Balance for address: ${address}`)
  const weiBalance = await web3.eth.getBalance(address);
  setBusyCallback(false)
  return web3.utils.fromWei(weiBalance,'ether')
}

export async function getErc20Balance(contractAddress, address, web3, setBusyCallback){
  setBusyCallback(true, `checking Erc20 Balance for address: ${address}`)
  const contractInstance = new web3.eth.Contract(ABI,contractAddress);
  const balance = await contractInstance.methods.balanceOf(address).call()
  setBusyCallback(false)
  return balance;
}