import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { DappAction } from "oreid-js/dist/webwidget";
import { ChainNetwork, ExternalWalletType } from "oreid-js";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RefreshIcon from "@material-ui/icons/Refresh";
import {
  Avatar,
  Card,
  CardHeader,
  CardMedia,
  CardActions,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TextField,
  MenuItem,
  TableRow,
  Checkbox,
  InputLabel,
  Select,
  FormControl,
  Button,
  Tooltip,
  Chip,
} from "@material-ui/core";
import transactionTemplate from "./transactionTemplate.json";
import { ReactComponent as OREIDBadge } from "./oreid-badge.svg";

const FormTitle = {
  ConnectWallet: "Connect Wallet",
  ChoosePermission: "Choose Permission",
  ChooseChainNetwork: "Choose Chain Network",
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "500px",
    position: "relative",
  },
  title: {
    fontSize: 14,
  },
  dappPill: {
    backgroundColor: theme.palette.common.white,
  },
  cardHeader: {
    position: "absolute",
    "& :hover": {
      color: theme.palette.common.white,
      "& $dappPill": {
        backgroundColor: theme.palette.primary.light,
      },
    },
  },
  cardMedia: {
    height: 250,
  },
  cardContent: {
    position: "relative",
  },
  contentActions: {
    textAlign: "end",
  },
  pos: {
    marginBottom: 12,
  },
  label: {
    zIndex: 0,
  },
  form: {
    width: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: theme.spacing(4),
  },
  formControl: {
    margin: theme.spacing(1),
  },
  logout: {
    marginLeft: "auto !important",
    marginRight: 8,
    [theme.breakpoints.down("md")]: {
      marginRight: 0,
    },
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  tableHeadRow: {
    whiteSpace: "nowrap",
    backgroundColor: theme.palette.common.black,
    "& th": {
      color: theme.palette.common.white,
    },
  },
  cardActions: {
    padding: theme.spacing(2),
    gap: theme.spacing(4),
    flexDirection: "column",
  },
  badge: {
    width: "100%",
    textAlign: "center",
    paddingBottom: theme.spacing(2),
  },
}));

/** Show user info and options (after logging in )*/
const UserOreId = (props) => {
  const { onAction, userInfo, onLogout, onRefresh, appId } = props;
  const { accountName, email, name, picture, permissions, username } = userInfo;

  const [selectedPermission, setSelectedPermission] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [chainNetwork, setChainNetwork] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [sampleTransaction, setSampleTransaction] = useState(JSON.stringify(transactionTemplate, null, 4));

  const styles = useStyles();

  const handleSelectChainAccountNetwork = (event) => {
    event.preventDefault();
    setOpenDialog(false);
    onAction(DappAction.NewAccount, { chainNetwork });
  };

  const handleSelectPermission = (event) => {
    event.preventDefault();
    setOpenDialog(false);
    onAction(DappAction.Sign, { chainAccountPermission: userInfo?.permissions[selectedPermission] });
  };

  const handleConnectWallet = (event) => {
    event.preventDefault();
    setOpenDialog(false);
    onAction("signString", { chainNetwork, walletType });
  };

  const handleSelectAction = (event) => {
    const action = event.target.value;
    switch (action) {
      case DappAction.Sign:
        setDialogTitle(FormTitle.ChoosePermission);
        setOpenDialog(true);
        return;
      case DappAction.NewAccount:
        setDialogTitle(FormTitle.ChooseChainNetwork);
        setOpenDialog(true);
        return;
      default:
        break;
    }
    onAction(action);
  };

  return (
    <Card className={styles.root} variant="outlined">
      <CardHeader
        className={styles.cardHeader}
        subheader={
          <Chip
            className={styles.dappPill}
            label={appId}
            onClick={() => window.open(`https://oreid.io/app/${appId}`, "_blank").focus()}
            color="primary"
            avatar={<Avatar aria-label={name}>{name[0].toUpperCase()}</Avatar>}
            variant="outlined"
          />
        }
      />
      <CardMedia className={styles.cardMedia} image={picture} title={name} />
      <CardContent className={styles.cardContent}>
        <Typography className={styles.title} color="textSecondary" gutterBottom>
          {accountName}
        </Typography>
        <Typography variant="h5" component="h2">
          {name}
        </Typography>
        <Typography className={styles.pos} color="textSecondary">
          {username}
        </Typography>
        <Typography variant="body2" component="p">
          {email}
        </Typography>
        <div className={styles.contentActions}>
          <Tooltip title="Connect Wallet">
            <IconButton
              color="primary"
              aria-label="connect wallet"
              onClick={() => {
                setDialogTitle(FormTitle.ConnectWallet);
                setOpenDialog(true);
              }}
            >
              <AccountBalanceWalletIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton color="primary" aria-label="refresh" onClick={() => onRefresh()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
              {dialogTitle === FormTitle.ConnectWallet && (
                <form className={styles.form}>
                  <FormControl fullWidth variant="outlined" margin="dense">
                    <InputLabel id="chain-network">Chain Network</InputLabel>
                    <Select
                      label="Chain Network"
                      labelId="chain-network"
                      value={chainNetwork || ""}
                      onChange={(e) => setChainNetwork(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {Object.keys(ChainNetwork).map((chainNetwork, index) => (
                        <MenuItem key={index} value={ChainNetwork[chainNetwork]}>
                          {chainNetwork}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth variant="outlined" margin="dense">
                    <InputLabel id="wallet-type">Wallet Type</InputLabel>
                    <Select label="Wallet Type" labelId="wallet-type" value={walletType || ""} onChange={(e) => setWalletType(e.target.value)}>
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {Object.keys(ExternalWalletType).map((externalWalletType, index) => (
                        <MenuItem key={index} value={ExternalWalletType[externalWalletType]}>
                          {externalWalletType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl margin="dense">
                    <Button variant="contained" color="primary" type="submit" disabled={!chainNetwork || !walletType} onClick={handleConnectWallet}>
                      Connect
                    </Button>
                  </FormControl>
                </form>
              )}
              {dialogTitle === FormTitle.ChoosePermission && (
                <form className={styles.form}>
                  <FormControl color="primary" margin="dense" variant="outlined">
                    <InputLabel id="select-permission">Permission</InputLabel>
                    <Select
                      labelId="select-permission"
                      id="select-permission"
                      value={selectedPermission}
                      onChange={(e) => {
                        setSelectedPermission(e.target.value);
                        setSampleTransaction(JSON.stringify(transactionTemplate, null, 4));
                      }}
                      label="Permission"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {userInfo.permissions.map((permission, index) => (
                        <MenuItem key={index} value={index}>
                          {permission.permission} ({permission.chainNetwork})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl color="secondary" margin="dense" variant="outlined">
                    <TextField
                      multiline
                      label="Transaction"
                      labelId="transaction"
                      variant="outlined"
                      color="secondary"
                      rows="5"
                      value={sampleTransaction
                        .replace(/\$actor/g, userInfo?.permissions[selectedPermission]?.chainAccount || "")
                        .replace(/\$permission/g, userInfo?.permissions[selectedPermission]?.permission || "")}
                      onChange={(e) => setSampleTransaction(e.currentTarget.value)}
                    />
                  </FormControl>
                  <FormControl margin="dense">
                    <Button variant="contained" color="primary" type="submit" disabled={selectedPermission === ""} onClick={handleSelectPermission}>
                      Sign with Permission
                    </Button>
                  </FormControl>
                </form>
              )}
              {dialogTitle === FormTitle.ChooseChainNetwork && (
                <form className={styles.form}>
                  <FormControl fullWidth variant="outlined" margin="dense">
                    <InputLabel id="chain-network">Chain Network</InputLabel>
                    <Select
                      label="Chain Network"
                      labelId="chain-network"
                      value={chainNetwork || ""}
                      onChange={(e) => setChainNetwork(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {Object.keys(ChainNetwork).map((chainNetwork, index) => (
                        <MenuItem key={index} value={ChainNetwork[chainNetwork]}>
                          {chainNetwork}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl margin="dense">
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={chainNetwork === ""}
                      onClick={handleSelectChainAccountNetwork}
                    >
                      Create Chain Account
                    </Button>
                  </FormControl>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
      <CardContent>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography className={styles.permissions}>Permissions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table className={styles.table} aria-label="permissions table">
                <TableHead>
                  <TableRow className={styles.tableHeadRow}>
                    <TableCell>Name</TableCell>
                    <TableCell>Account Type</TableCell>
                    <TableCell>Chain Network</TableCell>
                    <TableCell>External Wallet</TableCell>
                    <TableCell>Verified</TableCell>
                    <TableCell>External Private Key</TableCell>
                    <TableCell>Chain Account</TableCell>
                    <TableCell>Public Key</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map((permission, index) => (
                    <TableRow className={styles.tableRow} key={index}>
                      <TableCell component="th" scope="row">
                        {permission.permission || ""}
                      </TableCell>
                      <TableCell>{permission.accountType || ""}</TableCell>
                      <TableCell>{permission.chainNetwork || ""}</TableCell>
                      <TableCell>{permission.externalWalletType || ""}</TableCell>
                      <TableCell align="center" padding="checkbox">
                        <Checkbox disabled checked={permission.isVerified || false} />
                      </TableCell>
                      <TableCell align="center" padding="checkbox">
                        <Checkbox disabled checked={permission.privateKeyStoredExterally || false} />
                      </TableCell>
                      <TableCell>{permission.chainAccount || ""}</TableCell>
                      <TableCell>{permission.publicKey || ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </CardContent>
      <CardActions className={styles.cardActions}>
        <FormControl fullWidth color="primary" margin="dense" variant="outlined" className={styles.formControl}>
          <InputLabel className={styles.label} id="widget-action">
            Widget Action
          </InputLabel>
          <Select labelId="widget-action" id="select-outlined" label="Widget Action" defaultValue="" onChange={handleSelectAction}>
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={DappAction.Sign}>Sign</MenuItem>
            <MenuItem value={DappAction.NewAccount}>New Account</MenuItem>
            <MenuItem value={DappAction.RecoverAccount}>Recover Account (Reset Password/Pin)</MenuItem>
          </Select>
        </FormControl>
        <Button endIcon={<ExitToAppIcon />} className={styles.logout} onClick={onLogout} variant="outlined" color="secondary">
          Logout
        </Button>
      </CardActions>
      <div className={styles.badge}>
        <OREIDBadge />
      </div>
    </Card>
  );
};

export default UserOreId;
