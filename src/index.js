console.log('Environment: ' + process.env.NODE_ENV);
console.log('API_URL: ' + process.env.API_URL);

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import App from './app'

// these 7 lines are just to remove the deprecation warning
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
    suppressDeprecationWarnings: true,
  },
});
// delete the MuiThemeProvider wrapper below when deprecation completes
const root = document.querySelector('#root')
ReactDOM.render(
  <MuiThemeProvider theme={theme}>
  <App />
  </MuiThemeProvider>
  , root)
