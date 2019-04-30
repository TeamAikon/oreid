import React from 'react';
import { observer } from 'mobx-react-lite';
import SignButton from './SignButton';
import Utils from '../js/utils';

function SigningOptions(props) {
  const { model, ore } = props;
  const { permissions } = model.userInfo;

  const permissionsToRender = (permissions || []).slice();

  async function handleSignSampleTransaction(provider, account, chainAccount, chainNetwork, permission) {
    try {
      model.clearErrors();

      const transaction = Utils.createSampleTransaction(chainAccount, permission);
      const signOptions = {
        provider: provider || '', // wallet type (e.g. 'scatter' or 'oreid')
        account: account || '',
        broadcast: false, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
        chainAccount: chainAccount || '',
        chainNetwork: chainNetwork || '',
        state: 'abc', // anything you'd like to remember after the callback
        transaction,
        accountIsTransactionPermission: false,
      };
      const signResponse = await ore.sign(signOptions);
      // if the sign responds with a signUrl, then redirect the browser to it to call the signing flow
      const { signUrl, signedTransaction } = signResponse || {};
      if (signUrl) {
        // redirect browser to signUrl
        window.location = signUrl;
      }
      if (signedTransaction) {
        ore.displayResults(signedTransaction, 'Signed transaction');
      }
    } catch (error) {
      ore.displayResults(error, 'Error');
    }
  }

  async function handleSignButton(permissionIndex) {
    model.clearErrors();

    const { chainAccount, chainNetwork, permission, externalWalletType: provider } = permissionsToRender[permissionIndex] || {};
    const { accountName } = model.userInfo;
    // default to ore id
    await handleSignSampleTransaction(provider || 'oreid', accountName, chainAccount, chainNetwork, permission);
  }

  // render one sign transaction button for each chain
  function renderSignButtons() {
    return permissionsToRender.map((permission, index) => {
      const provider = permission.externalWalletType || 'oreid';
      return (
        <div className="sign-button-group" key={index}>
          <SignButton
            provider={provider}
            data-tag={index}
            buttonStyle={{
              width: 225,
              marginLeft: -20,
              marginTop: 20,
              marginBottom: 10,
            }}
            text={`Sign with ${provider}`}
            onClick={() => {
              handleSignButton(index);
            }}
          >
            {`Sign Transaction with ${provider}`}
          </SignButton>
          <div className="button-message">{`Chain:${permission.chainNetwork} ---- Account:${permission.chainAccount} ---- Permission:${permission.permission}`}</div>
        </div>
      );
    });
  }

  return (
    <div className="boxClass">
      <div className="header-title">Sign transaction with one of your keys</div>
      <div>{renderSignButtons()}</div>
    </div>
  );
}

export default observer(SigningOptions);
