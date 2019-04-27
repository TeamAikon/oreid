import React from 'react';
import WalletButton from './WalletButton';

function DiscoveryButtons(props) {
  const { isLoggedIn, chainNetworkForExample, click } = props;

  const buttonBox = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
    flexDirection: 'column',
  };
  const innerButtonBox = {
    display: 'flex',
    flexDirection: 'column',
  };
  const buttonGroupStyle = {
    display: 'flex',
    flexWrap: 'wrap',
  };

  const walletButtons = [
    { provider: 'scatter', chainNetworkForExample },
    { provider: 'ledger', chainNetworkForExample },
    { provider: 'lynx', chainNetworkForExample },
    { provider: 'meetone', chainNetworkForExample },
    { provider: 'tokenpocket', chainNetworkForExample },
  ];

  if (isLoggedIn) {
    return (
      <div style={buttonBox}>
        <div style={innerButtonBox}>
          <div>
            <div>
              <h3>Or discover a key in your wallet</h3>
              <div style={buttonGroupStyle}>
                {walletButtons.map((wallet, index) => {
                  const provider = wallet.provider;
                  return (
                    <div key={index}>
                      <WalletButton
                        provider={provider}
                        data-tag={index}
                        text={`${provider}`}
                        onClick={() => {
                          click(index);
                        }}
                      >
                        {`${provider}`}
                      </WalletButton>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default DiscoveryButtons;
