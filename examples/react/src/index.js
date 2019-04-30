import React from 'react';
import { render } from 'react-dom';
import { useLocalStore } from 'mobx-react-lite';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import App from './App';
import './assets/app.scss';
import ORE from './js/ore';

const theme = createMuiTheme({
  palette: {
    primary: blue,
  },
  typography: {
    useNextVariants: true,
  },
});

function Root() {
  const model = useLocalStore(() => ({
    userInfo: [],
    isLoggedIn: false,
    errorMessage: '',
    signedTransaction: null,
    signState: null,
    clearErrors() {
      this.errorMessage = null;
      this.signedTransaction = null;
      this.signState = null;
    },
  }));

  const ore = new ORE(model);

  return (
    <MuiThemeProvider theme={theme}>
      <App ore={ore} model={model} />
    </MuiThemeProvider>
  );
}

render(<Root />, document.getElementById('root'));
