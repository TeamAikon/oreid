import React, { useState } from 'react';
import { ExternalWalletType, ChainNetwork } from 'oreid-js';
import LoginButton from 'oreid-login-button';

const supportedWallets = [
  ExternalWalletType.Anchor,
  ExternalWalletType.Ledger,
  ExternalWalletType.Lynx,
  ExternalWalletType.Scatter,
  ExternalWalletType.TokenPocket,
  ExternalWalletType.Wombat
];

const TX_TYPE_SIGN_STRING = 'SignString';
const TX_TYPE_TRANSFER = 'Transfer';
const TX_TYPE_DEMOAPPHELLO = 'DemoAppHello';

const supportedTxtypes = [
  TX_TYPE_SIGN_STRING,
  TX_TYPE_TRANSFER,
  TX_TYPE_DEMOAPPHELLO
];

const supportedChainNetworks = [
  ChainNetwork.EosKylin,
  ChainNetwork.EosMain,
  ChainNetwork.EosJugle
];

// css styles
const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  marginRight: 25,
  fontWeight: 700
};
const labelStyle = {
  fontSize: 18,
  marginBottom: 4,
  cursor: 'pointer'
};

const dropdownStyle = {
  textTransform: 'capitalize',
  minWidth: 200
};

const SignEosTxWithWallet = (props) => {
  const [txType, setTxType] = useState('');
  const [chainNetwork, setChainNetwork] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [chainAccount, setChainAccount] = useState('');
  const [txResponse, setTxResponse] = useState('');
  const [txError, setTxError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleButtonClick = async () => {
    // reset existing response & error
    setTxError('');
    setTxResponse('');

    // check if all required options are selected
    if (!txType || !chainNetwork || !selectedWallet) {
      alert('Please select all required options first!');
      return;
    }

    const { oreId, userInfo } = props;
    // initialize txBody, wallet
    let txBody;
    let wallet;
    setProcessing(true);

    try {
      if (txType === TX_TYPE_SIGN_STRING) {
        txBody = {
          account: userInfo?.accountName,
          walletType: selectedWallet,
          provider: selectedWallet,
          chainNetwork,
          string: 'Hello World!',
          message: 'Testing demo app - sign string functionality'
        };
      } else if (txType === TX_TYPE_TRANSFER) {
        // get the transferTo account
        const toAccount = prompt('Please enter toAccount name', 'aikontest112');
        // get the transfer amount (in EOS)
        const amount = prompt('Please enter the amount (in EOS)', '0.0010 EOS');

        // connect to users wallet
        wallet = await oreId.auth.connectWithWallet({ walletType: selectedWallet, chainNetwork, chainAccount });

        txBody = {
          actions: [{
            account: 'eosio.token',
            name: 'transfer',
            authorization: [{
              actor: wallet.chainAccount,
              permission: 'active'
            }],
            data: {
              from: wallet.chainAccount,
              to: toAccount,
              quantity: amount,
              memo: 'Aikon rocks!!!'
            }
          }]
        };
      } else if (txType === TX_TYPE_DEMOAPPHELLO) {
        // connect to users wallet
        wallet = await oreId.auth.connectWithWallet({ walletType: selectedWallet, chainNetwork, chainAccount });

        txBody = {
          actions: [{
            account: 'demoapphello',
            name: 'hi',
            authorization: [
              {
                actor: wallet.chainAccount,
                permission: 'active'
              }
            ],
            data: {
              user: wallet.chainAccount
            }
          }]
        };
      }

      // execute the transaction
      if (txType === TX_TYPE_SIGN_STRING) {
        const response = await oreId.signStringWithWallet(txBody);
        setTxResponse(JSON.stringify(response));
      } else {
        const transaction = await oreId.createTransaction({
          account: userInfo?.accountName || '',
          chainAccount: wallet.chainAccount,
          chainNetwork: wallet.chainNetwork,
          transaction: txBody,
          signOptions: {
            broadcast: true,
            returnSignedTransaction: true,
            provider: selectedWallet
          }
        });

        const result = await transaction.signWithWallet(selectedWallet);
        console.log('transaction.signWithWallet - result', result);
        const { signedTransaction } = result;
        if (signedTransaction) {
          const resObj = {
            signatures: signedTransaction?.signatures,
            transactionId: signedTransaction?.transactionId || signedTransaction?.transaction_id,
            payload: signedTransaction?.payload
          };
          if (signedTransaction?.processed?.receipt) {
            resObj.receipt = signedTransaction?.processed?.receipt;
          }
          setTxResponse(JSON.stringify(resObj));
        };
      }
    } catch (error) {
      console.log('error', error);
      setTxError(error?.message);
    }

    setProcessing(false);
  };

  return (
    <div style={{ marginTop: 50, marginLeft: 20, marginBottom: 100, background: '#eee', padding: 25 }}>
      <hr />
      <h3>Sign EOS Tx with your Wallet</h3>
      <div style={{ marginTop: 40, marginBottom: 40, display: 'flex' }}>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="txType">Select Transaction</label>
          <select style={dropdownStyle} id="txType" value={txType} onChange={(e) => { setTxType(e.target.value); }}>
            <option value="" disabled>Select Transaction</option>
            { supportedTxtypes && supportedTxtypes.map((tx) => <option key={tx} value={tx}>{tx}</option>)}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="chainNetwork">Select ChainNetwork</label>
          <select style={dropdownStyle} id="chainNetwork" value={chainNetwork} onChange={(e) => { setChainNetwork(e.target.value); }}>
            <option value="" disabled>Select ChainNetwork</option>
            { supportedChainNetworks && supportedChainNetworks.map((cn) => <option key={cn} value={cn}>{cn}</option>)}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="wallet">Select Wallet</label>
          <select style={dropdownStyle} id="wallet" value={selectedWallet} onChange={(e) => { setSelectedWallet(e.target.value); }}>
            <option value="" disabled>Select Wallet</option>
            { supportedWallets && supportedWallets.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="chainAccount">Enter ChainAccount</label>
          <input id="chainAccount" value={chainAccount} onChange={(e) => { setChainAccount(e.target.value); }} placeholder="Enter ChainAccount"/>
        </div>

      </div>

      { processing && <div style={{ marginTop: 20, marginBottom: 20, background: '#bde2ff', padding: 30, wordBreak: 'break-all' }}>PROCESSING...</div> }

      { txResponse &&
        <div style={{ marginTop: 20, marginBottom: 20, background: '#fbffd2', padding: 30, wordBreak: 'break-all' }}>
          <code>
            { txResponse }
          </code>
        </div>
      }

      { txError &&
        <div style={{ marginTop: 20, marginBottom: 20, background: '#ffe0d6', padding: 30, wordBreak: 'break-all' }}>
          <code>
            { txError }
          </code>
        </div>
      }

      { selectedWallet &&
      <div style={{ marginTop: 20 }}>
        <LoginButton
          key={selectedWallet}
          provider={selectedWallet}
          data-tag={`discover-${selectedWallet}`}
          buttonStyle={{
            width: '100%',
            minHeight: '60px',
            cursor: 'pointer'
          }}
          onClick={handleButtonClick}
          text={`Sign Transaction with ${capitalizeFirstLetter(selectedWallet)}`}
        />
      </div>
      }

    </div>
  );
};

export default SignEosTxWithWallet;

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}