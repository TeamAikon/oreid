import React from 'react';

function SigningOptions(props) {
  const { isBusy, errorMessage, signedTransaction, signState } = props;

  const messageBox = {
    width: '80vw',
    wordWrap: 'break-word',
  };

  return (
    <div style={messageBox}>
      <h3 style={{ color: 'green' }}>{isBusy && 'working...'}</h3>
      <div style={{ color: 'red' }}>{errorMessage && errorMessage}</div>
      <div style={{ color: 'blue' }}>{signedTransaction && `Returned signed transaction: ${signedTransaction}`}</div>
      <div style={{ color: 'blue' }}>{signState && `Returned state param: ${signState}`}</div>
    </div>
  );
}

export default SigningOptions;
