import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import JSONView from './JSONView';

const styles = {
  root: {
    flexGrow: 1,
  },
  nameBox: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
  },
  nameText: {
    lineHeight: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 10,
  },
  imageWrapper: {
    margin: '2px 10px 2px 0',
    borderRadius: '500px',
    height: '30px',
    width: '30px',
    border: 'solid 1px rgba(0,0,0,.5)',
    overflow: 'hidden',
  },
};

function HeaderBar(props) {
  const { classes, logout, isLoggedIn, userInfo } = props;
  let image = null;
  let name = 'ORE ID';
  let accountName = '';
  const [open, setOpen] = useState(false);

  function handleClose() {
    setOpen(false);
  }

  function showDialog() {
    setOpen(true);
  }

  if (userInfo) {
    if (userInfo.picture) {
      image = userInfo.picture;
    }
    if (userInfo.name) {
      name = userInfo.name;
    } else if (userInfo.username) {
      name = userInfo.username;
    }
    if (userInfo.accountName) {
      accountName = `account: ${userInfo.accountName}`;
    }
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={() => {
              if (isLoggedIn) {
                showDialog();
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          {image && (
            <div className={classes.imageWrapper}>
              <img src={image} alt="" style={{ height: '100%' }} />
            </div>
          )}

          <div className={classes.nameBox}>
            <Typography variant="body2" className={classes.nameText} color="inherit">
              {name}
            </Typography>
            <Typography variant="body2" className={classes.nameText} color="inherit">
              {accountName}
            </Typography>
          </div>
          {isLoggedIn && (
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <div>
        <Dialog open={open} onClose={handleClose} scroll="paper" aria-labelledby="scroll-dialog-title">
          <DialogTitle id="scroll-dialog-title">Account Information</DialogTitle>
          <DialogContent>
            <JSONView userInfo={userInfo} hideButton mode="account" />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default withStyles(styles)(HeaderBar);
