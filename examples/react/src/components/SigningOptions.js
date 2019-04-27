import React from 'react';
import SignButton from './SignButton';

function SigningOptions(props) {
  const { permissions, isLoggedIn, click } = props;

  const permissionsToRender = (permissions || []).slice(0);

  // render one sign transaction button for each chain
  function renderSignButtons() {
    permissionsToRender.map((permission, index) => {
      const provider = permission.externalWalletType || 'oreid';
      return (
        <div style={{ alignContent: 'center' }} key={index}>
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
              click(index);
            }}
          >
            {`Sign Transaction with ${provider}`}
          </SignButton>
          {`Chain:${permission.chainNetwork} ---- Account:${permission.chainAccount} ---- Permission:${permission.permission}`}
        </div>
      );
    });
  }

  if (isLoggedIn) {
    return (
      <div>
        <div>
          <h3>Sign transaction with one of your keys</h3>
          <ul>{renderSignButtons()}</ul>
        </div>
      </div>
    );
  }

  return null;
}

export default SigningOptions;
