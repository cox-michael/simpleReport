import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  // Toolbar,
  IconButton,
  Tooltip,
  Typography,
  Slide,
} from '@material-ui/core';
import {
  Close,
  PlayArrow,
} from '@material-ui/icons';
import Editor, { monaco } from '@monaco-editor/react';
import SplitPane from 'react-split-pane';
import MaterialTable from 'material-table';
import { Row, Spinner } from '../components';
import { DefDispatch, DefContext } from './Context';
import { SessionContext } from '../Session';
import { useFetch } from '../hooks';

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  container: {
    marginTop: theme.spacing(1),
    height: 'calc(100% - 72px)',
  },
  connection: {
    minWidth: 150,
    margin: theme.spacing(1),
  },
  '@global': {
    // '.SplitPane': {
    //   marginTop: 72,
    // },
    '.Resizer': {
      mozBoxSizing: 'border-box',
      WebkitBoxSizing: 'border-box',
      boxSizing: 'border-box',
      background: '#000',
      padding: 2,
      opacity: 0.5,
      zIndex: 1,
      mozBackgroundClip: 'padding',
      webkitBackgroundClip: 'padding',
      backgroundClip: 'padding-box',
    },
    '.Resizer:hover': {
      webkitTransition: 'all 0.5s ease',
      transition: 'all 0.5s ease',
    },
    '.Resizer.horizontal': {
      height: '11px',
      margin: '-5px 0',
      borderTop: '5px solid rgba(255, 255, 255, 0)',
      borderBottom: '5px solid rgba(255, 255, 255, 0)',
      cursor: 'row-resize',
      width: '100%',
    },
    // '.Resizer.horizontal:hover': {
    //   borderTop: '5px solid rgba(0, 0, 0, 0.5)',
    //   borderBottom: '5px solid rgba(0, 0, 0, 0.5)',
    // },
    '.Resizer.vertical': {
      width: '11px',
      margin: '0 -5px',
      borderLeft: '5px solid rgba(255, 255, 255, 0)',
      borderRight: '5px solid rgba(255, 255, 255, 0)',
      cursor: 'col-resize',
    },
    // '.Resizer.vertical:hover': {
    //   borderLeft: '5px solid rgba(0, 0, 0, 0.5)',
    //   borderRight: '5px solid rgba(0, 0, 0, 0.5)',
    // },
  },
  pane: {
    width: '100%',
  },
}));

// eslint-disable-next-line react/display-name
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const QueryDialog = props => {
  const classes = useStyles();

  const {
    dataSourceIndex,
    name,
    value,
    connectionId,
    data,
    queryDialogOpen,
    setQueryDialogOpen,
  } = props;

  const { connections, getConnections, connectionsLoading } = useContext(SessionContext);
  const dispatch = useContext(DefDispatch);
  const { dataSources } = useContext(DefContext);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const valueGetter = useRef();

  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [connId, setConnId] = useState('');

  const setData = d => {
    if (d.length) {
      dispatch([{ dataSourceIndex }, { name: 'data', value: d }]);
      dispatch([{ dataSourceIndex }, { name: 'columnNames', value: Object.keys(d[0]) }]);
    }
  };

  const [runDataSource, querying] = useFetch('runDataSource', setData);

  useEffect(() => {
    if (!connections.length) getConnections();
  }, []);

  useEffect(() => {
    setConnId(connectionId);
  }, [value, connectionId, queryDialogOpen]);

  const handleSave = () => {
    dispatch([{ dataSourceIndex }, { name: 'value', value: valueGetter.current() }]);
    dispatch([{ dataSourceIndex }, { name: 'connectionId', value: connId }]);
    setQueryDialogOpen(false);
  };

  const closeDialog = () => {
    if (value === valueGetter.current() && connId === connectionId) {
      setQueryDialogOpen(false);
      return;
    }

    setDiscardDialogOpen(true);
  };

  const runDs = () => {
    dispatch([{ dataSourceIndex }, { name: 'value', value: valueGetter.current() }]);
    dispatch([{ dataSourceIndex }, { name: 'connectionId', value: connId }]);
    const conn = connections.find(c => c._id === connId);
    if (conn && conn.name === 'SQLite') {
      // do sqlite stuff

      runDataSource({
        connectionId: connId,
        query: valueGetter.current(),
        support: dataSources.slice(0, dataSourceIndex)
          .map(ds => ({ name: ds.name, data: ds.data })),
      });
      return;
    }

    runDataSource({ connectionId: connId, query: valueGetter.current() });
  };

  const handleEditorDidMount = (vg, editor) => {
    setIsEditorReady(true);
    valueGetter.current = vg;

    monaco
      .init()
      .then(m => {
        // editor.createContextKey('execute', true);
        // editor.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.Enter, function() {
        //     alert('my command is executing!');
        // }, 'execute')
        editor.addAction({
          id: 'execute-query',
          label: 'Execute Query',
          keybindings: [
            // eslint-disable-next-line no-bitwise
            m.KeyMod.Alt | m.KeyCode.KEY_X,
            // eslint-disable-next-line no-bitwise
            m.KeyMod.CtrlCmd | m.KeyCode.Enter,
          ],
          run: runDs,
        });
      })
      .catch(err => console.error(err));
  };

  const theme = createMuiTheme({
    palette: {
      type: 'dark',
    },
  });

  const cellStyle = { padding: 2 };
  const columns = (data[0] ? Object.keys(data[0]) : []).filter(c => c !== 'tableData').map(c => (
    { title: c, field: c, cellStyle }
  ));

  return (
    <>
      <Dialog
        fullScreen
        open={queryDialogOpen}
        onClose={() => setQueryDialogOpen(false)}
        TransitionComponent={Transition}
        disableEscapeKeyDown
      >
        <AppBar className={classes.appBar}>
          <Row justifyContent="space-between" alignItems="center">
            <Row justifyContent="space-between" alignItems="center">
              <IconButton color="inherit" onClick={closeDialog}>
                <Close />
              </IconButton>
              <div>
                <Typography variant="h6">
                  {name}
                </Typography>
              </div>
            </Row>

            <ThemeProvider theme={theme}>
              <FormControl className={classes.connection}>
                <InputLabel htmlFor="value">Connection</InputLabel>
                <Select
                  value={connId}
                  onChange={e => setConnId(e.target.value)}
                >
                  <MenuItem value=""><em>{connectionsLoading ? 'Loading...' : 'None'}</em></MenuItem>
                  {connections.map(c => (
                    <MenuItem value={c._id} key={c._id}>
                      {connectionsLoading ? (<em>Loading...</em>) : c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title="Execute Query (Ctrl+Enter or Alt+X)">
                <IconButton onClick={runDs}><PlayArrow /></IconButton>
              </Tooltip>
            </ThemeProvider>

            <Button color="inherit" onClick={handleSave} disabled={!isEditorReady}>
              save
            </Button>
          </Row>
        </AppBar>
        <div className={classes.container}>
          <SplitPane
            split="horizontal"
            defaultSize="50%"
            minSize={20}
            style={{ position: 'inherit' }}
            pane2Style={{ overflow: 'auto' }}
          >
            <div className={classes.pane}>
              <Editor
                value={value}
                language="sql"
                loading={<Spinner center centerScreen />}
                editorDidMount={handleEditorDidMount}
              />
              {/* <div style={{ height: '1000px', backgroundColor: 'slategray' }}>shape</div> */}
            </div>
            <div className={classes.pane}>
              {querying ? (
                <Spinner center />
              ) : (
                <MaterialTable {...{
                  title: `${data.length} rows`,
                  columns,
                  data,
                  options: {
                    showTitle: !!data.length,
                  },
                }}
                />
              )}
            </div>
          </SplitPane>
        </div>
      </Dialog>

      <Dialog
        open={discardDialogOpen}
        onClose={() => setDiscardDialogOpen(false)}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to discard changes?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscardDialogOpen(false)} color="default" autofocus>
            No
          </Button>
          <Button
            onClick={() => { setDiscardDialogOpen(false); setQueryDialogOpen(false); }}
            color="primary"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

QueryDialog.propTypes = {
  dataSourceIndex: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  connectionId: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.object),
  queryDialogOpen: PropTypes.bool.isRequired,
  setQueryDialogOpen: PropTypes.func.isRequired,
};

QueryDialog.defaultProps = {
  value: '',
  connectionId: '',
  data: [],
};

export default QueryDialog;
