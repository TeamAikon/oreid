import React from 'react';
import Button from '@material-ui/core/Button';
import { observer } from 'mobx-react-lite';

function UserInfo(props) {
  const { ore, model } = props;

  const { accountName, email, name, picture, username } = model.userInfo;

  function clickedLogout() {
    ore.logout();
  }

  return (
    <div className="boxClass">
      <div className="header-title">Logged in:</div>
      <div className="user-info-box">
        <img src={picture} style={{ width: 50, height: 50 }} alt="user" />
        <div className="info-title"> accountName</div>
        <div>{accountName}</div>

        <div className="info-title"> name</div>
        <div>{name}</div>

        <div className="info-title"> username</div>
        <div>{username}</div>

        <div className="info-title"> email</div>
        <div>{email}</div>
      </div>

      <Button variant="outlined" size="small" onClick={clickedLogout} color="primary">
        Logout
      </Button>
    </div>
  );
}

export default observer(UserInfo);
