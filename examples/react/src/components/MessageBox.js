import React from 'react';
import { observer } from 'mobx-react-lite';
import { intercept } from 'mobx';
import $ from 'jquery';

function MessageBox(props) {
  const { model } = props;

  const { results, resultsTitle } = model;

  // auto resize the textarea
  intercept(model, 'results', (change) => {
    // must delay it since this is before value is set
    setTimeout(() => {
      const textArea = $('.resultText');
      if (textArea.length > 0) {
        const height = Math.min(500, textArea[0].scrollHeight);
        textArea.css('height', `${height}px`);
      }
    }, 10);

    return change;
  });

  let contents = null;
  if (results && results.length > 0) {
    contents = (
      <div>
        <div className="header-title">Results</div>
        <div className="header-subtitle">{resultsTitle}</div>
        <textarea readOnly wrap="off" className="resultText" value={results} />
      </div>
    );
  }

  return <div className="boxClass">{contents}</div>;
}

export default observer(MessageBox);
