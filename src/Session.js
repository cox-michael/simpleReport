import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import {
  indigo,
  green,
} from '@material-ui/core/colors';
import Snack from './Snackbar';

const useFetch = (endpoint, cb, method = 'POST', context = {}) => {
  // eslint-disable-next-line global-require
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);
  const { loginState, setLoginState, openSnack } = context;

  const call = payload => new Promise((resolve, reject) => {
    setLoading(true);

    const request = {
      method,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    let url = `${process.env.API_URL}api/${endpoint}`;

    if (method === 'POST' && payload) request.body = JSON.stringify(payload);
    if (method === 'GET' && payload) {
      url += '?';
      url += Object.entries(payload).map(([key, val]) => `${key}=${val}`).join('&');
    }

    fetch(url, request)
      .then(response => {
        if (response.status === 401) {
          setLoginState({ ...loginState, isLoggedIn: false });
        }
        if (response.status === 404) {
          openSnack('API not found', 'error');
        }
        if (response.status === 500) {
          openSnack('Internal Server Error', 'error');
        }
        response.json().then(({ data, messages, success }) => {
          const errorMsg = messages.length ? messages[0] : 'An unknown error occurred';
          const successMsg = messages.length ? messages[0] : 'Success';

          setDenied(!success);
          if (success && cb) cb(data);
          if (success && messages.length) openSnack(messages[0], 'success');
          if (!success) openSnack(errorMsg, 'error');
          setLoading(false);

          if (success) { resolve(successMsg); return; }
          reject(new Error(errorMsg));
        });
      })
      .catch(err => console.error(err.message));
  });

  return [call, loading, denied];
};

const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: {
      main: green[800],
    },
    // error: red,
    // type: 'dark',
    // type: process.env.NODE_ENV === 'production' ? 'light' : 'dark',
    // contrastThreshold: 3,
    // Used to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    // tonalOffset: 0.2,
  },
  typography: {
    useNextVariants: true,
    suppressDeprecationWarnings: true,
  },
});

const SessionContext = React.createContext();
const SessionProvider = props => {
  const { loginState, setLoginState, children } = props;

  const [defReports, setDefReports] = useState({});

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackType, setSnackType] = useState('info');

  const [connections, setConnections] = useState([]);
  const [getConnections, connectionsLoading] = useFetch('getConnections', setConnections, 'GET');

  const [resources, setResources] = useState(null);
  const [getResources, resourcesLoading] = useFetch('getResources', setResources, 'GET');

  const [themes, setThemes] = useState(null);
  const [getThemes, themesLoading] = useFetch('getThemes', setThemes, 'GET');

  const [folders, setFolders] = useState(null);
  const [getFolders, foldersLoading] = useFetch('getFolders', setFolders, 'GET');

  const closeSnack = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackOpen(false);
  };

  const openSnack = (msg, type = 'info') => {
    const newSnack = () => {
      setSnackOpen(true);
      setSnackMsg(msg);
      setSnackType(type);
    };

    if (snackOpen) {
      closeSnack();
      setTimeout(newSnack, 200);
      return;
    }
    newSnack();
  };

  const context = {
    loginState,
    setLoginState,
    openSnack,
    getConnections,
    connectionsLoading,
    connections,
    openDefReports: def => setDefReports(def),
    closeDefReports: () => setDefReports({}),
    defReports,
    resources,
    getResources,
    resourcesLoading,
    themes,
    getThemes,
    themesLoading,
    folders,
    getFolders,
    foldersLoading,
  };

  console.log({ context });

  return (
    <SessionContext.Provider value={context}>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          {children}

          <Snack
            open={snackOpen}
            msg={snackMsg}
            type={snackType}
            closeSnack={closeSnack}
          />
        </ThemeProvider>
      </MuiThemeProvider>
    </SessionContext.Provider>
  );
};

SessionProvider.propTypes = {
  loginState: PropTypes.shape({
    isLoggedIn: PropTypes.bool.isRequired,
    displayName: PropTypes.string.isRequired,
    userid: PropTypes.string.isRequired,
    permissions: PropTypes.objectOf(PropTypes.array),
    preferences: PropTypes.object.isRequired,
  }).isRequired,
  setLoginState: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired,
};

export { SessionContext, SessionProvider };
