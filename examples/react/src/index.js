import React from 'react';
import { render } from 'react-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import App from './App';
import Model from './js/model';
import './assets/app.scss';

const theme = createMuiTheme({
  palette: {
    primary: blue,
  },
  typography: {
    useNextVariants: true,
  },
});

const model = new Model();

function Root() {
  return (
    <MuiThemeProvider theme={theme}>
      <App model={model} />
    </MuiThemeProvider>
  );
}

render(<Root />, document.getElementById('root'));
