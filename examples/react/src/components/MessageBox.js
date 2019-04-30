import React from 'react';
import { observer } from 'mobx-react-lite';
import { intercept } from 'mobx';
import $ from 'jquery';

function MessageBox(props) {
  const { isBusy, model } = props;

  const { results, errorMessage, signedTransaction, signState } = model;

  const messageBox = {
    width: '80vw',
    wordWrap: 'break-word',
  };

  // auto resize the textarea
  intercept(model, 'results', (change) => {
    // must delay it since this is before value is set
    setTimeout(() => {
      const textArea = $('.resultText');
      if (textArea.length > 0) {
        const height = Math.min(800, textArea[0].scrollHeight);
        textArea.css('height', `${height}px`);
      }
    }, 10);

    return change;
  });

  let contents = null;
  if (results && results.length > 0) {
    contents = (
      <div className="boxClass">
        <div>Results</div>
        <textarea readOnly wrap="off" className="resultText" value={results} />
      </div>
    );
  }

  return (
    <div>
      <div style={messageBox}>
        <h3 style={{ color: 'green' }}>{isBusy && 'working...'}</h3>
        <div style={{ color: 'red' }}>{errorMessage && errorMessage}</div>
        <div style={{ color: 'blue' }}>{signedTransaction && `Returned signed transaction: ${signedTransaction}`}</div>
        <div style={{ color: 'blue' }}>{signState && `Returned state param: ${signState}`}</div>
      </div>
      <div className="groupClass">{contents}</div>
    </div>
  );
}

export default observer(MessageBox);
