import React from 'react';
import WalletButton from './WalletButton';
import ENV from '../js/env';

function DiscoveryButtons(props) {
  const { ore, model } = props;

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

  const chainNetwork = ENV.chainNetwork;

  const walletButtons = [
    { provider: 'scatter', chainNetwork },
    { provider: 'ledger', chainNetwork },
    { provider: 'lynx', chainNetwork },
    { provider: 'meetone', chainNetwork },
    { provider: 'tokenpocket', chainNetwork },
  ];

  async function handleWalletDiscoverButton(permissionIndex) {
    try {
      model.clearErrors();

      const { provider } = walletButtons[permissionIndex] || {};
      if (ore.canDiscover(provider)) {
        await ore.discover({ provider, chainNetwork: ENV.chainNetwork });
      } else {
        console.log("Provider doesn't support discover, so we'll call login instead");
        await ore.login({ provider, chainNetwork: ENV.chainNetwork });
      }
      ore.loadUserFromApi(model.userInfo.accountName); // reload user from ore id api - to show new keys discovered
    } catch (error) {
      ore.displayResults(error, 'Error');
    }
  }

  return (
    <div className="boxClass">
      <div style={buttonBox}>
        <div style={innerButtonBox}>
          <div>
            <div>
              <div className="header-title">Or discover a key in your wallet</div>
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
                          handleWalletDiscoverButton(index);
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
    </div>
  );
}

export default DiscoveryButtons;
