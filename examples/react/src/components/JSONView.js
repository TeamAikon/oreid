import React, { useState, useEffect } from 'react';
import ReactJson from 'react-json-view';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';
import ArrowDownward from '@material-ui/icons/ArrowDropDown';
import EOSRpc from '../js/eosRpc';

export default function JSONView(props) {
  const [json, setJSON] = useState(null);

  const showButton = !props.hideButton;

  let startMode = props.mode;
  if (!startMode) {
    startMode = 'info';
  }
  const [mode, setMode] = useState(startMode);

  const eosRpc = new EOSRpc('https://kylin.eoscanada.com');
  const stagingRpc = new EOSRpc('https://ore-staging.openrights.exchange');

  const menuItems = [
    {
      mode: 'info',
    },
    {
      mode: 'account',
    },
    {
      mode: 'contract',
    },
  ];

  async function updateJSON() {
    let result = null;

    switch (mode) {
      case 'info':
        result = await eosRpc.getInfo();
        break;
      case 'account':
        result = await stagingRpc.getAccount(props.userInfo.accountName);
        break;
      case 'contract':
        result = await eosRpc.getRows('createbridge', 'createbridge', 'balances');
        break;
      default:
        break;
    }

    setJSON(result);
  }

  useEffect(() => {
    // Update the document title using the browser API
    updateJSON();
  }, [mode]);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'jsonMenu',
  });

  function menuSelected(state, appName) {
    setMode(appName);
    state.close();
  }

  let jsonView = null;
  if (json) {
    jsonView = (
      <ReactJson
        style={{ padding: '14px 10px', fontSize: '.8em' }}
        src={json}
        enableClipboard={false}
        onAdd={false}
        onDelete={false}
        displayDataTypes={false}
        displayObjectSize={false}
        indentWidth={2}
        iconStyle="triangle"
        theme="solarized"
      />
    );
  }

  const mainStyle = {
    marginTop: '16px',
  };
  const buttonStyle = {
    margin: '6px 20px',
  };

  return (
    <div style={mainStyle}>
      {showButton && (
        <div>
          <Button variant="outlined" style={buttonStyle} {...bindTrigger(popupState)}>
            {mode}
            <ArrowDownward />
          </Button>
          <Menu {...bindMenu(popupState)}>
            {menuItems.map((menu, index) => {
              return (
                <MenuItem key={index} onClick={() => menuSelected(popupState, menu.mode)}>
                  {menu.mode}
                </MenuItem>
              );
            })}
          </Menu>
        </div>
      )}

      {jsonView}
    </div>
  );
}
