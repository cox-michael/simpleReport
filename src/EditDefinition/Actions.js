import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
// import {
//   Backdrop,
//   // Button,
//   // CircularProgress,
// } from '@material-ui/core';
import {
  Description,
  FileCopy,
  Menu,
  Save,
} from '@material-ui/icons';
import {
  SpeedDial,
  SpeedDialAction,
} from '@material-ui/lab';
import { useHistory } from 'react-router-dom';
import { useFetch } from '../hooks';
import { SessionContext } from '../Session';

const useStyles = makeStyles(theme => ({
  // leftSmallIcon: {
  //   marginRight: theme.spacing(1),
  //   fontSize: 20,
  // },
  // button: {
  //   marginTop: theme.spacing(1),
  //   marginLeft: theme.spacing(1),
  // },
  floating: {
    position: 'fixed',
    top: theme.spacing(11),
    right: theme.spacing(3),
    zIndex: 100,
  },
  // progress: {
  //   // color: green[500],
  //   position: 'relative',
  //   top: -78, // 15 without <br />
  //   left: 43, // -60 without <br />
  //   zIndex: 10000,
  // },
  // progress2: {
  //   position: 'relative',
  //   top: -34, // 15 without <br />
  //   left: 43, // -60 without <br />
  //   zIndex: 10000,
  // },
  tooltip: {
    // background: '#333333',
    // color: 'white',
    whiteSpace: 'nowrap',
    // '&.MuiTooltip-tooltip': {
    //   background: '#333333',
    //   color: 'white',
    //   whiteSpace: 'nowrap',
    // },
  },
}));

const Actions = props => {
  const classes = useStyles();
  const { definition } = props;
  const history = useHistory();
  const { openSnack } = useContext(SessionContext);

  const [open, setOpen] = useState(false);

  const downloadFile = data => {
    const buf = Buffer.from(JSON.parse(data.buffer).data);
    const blob = new Blob([buf]);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.filename || definition.name}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const [save] = useFetch('addDefinition');
  const [saveAndClose] = useFetch('addDefinition', () => history.push('/'));
  const [runTest] = useFetch('runTest', downloadFile);
  const [runTestwsd] = useFetch('runTestWithStoredData', downloadFile);

  const runTwsd = () => {
    try {
      const err = definition.sheets.some(s => s.type !== 'Grouping' && (!s.tables || !s.tables.length));
      if (err) { openSnack('Each sheet must have a table', 'error'); return; }

      runTestwsd({
        ...definition,
        // eslint-disable-next-line react/prop-types
        sheets: definition.sheets.map(s => {
          if (s.type === 'Grouping') {
            return ({
              ...s,
              data: definition.dataSources.find(ds => ds.id === s.dataSourceId).data,
            });
          }
          return ({
            ...s,
            tables: s.tables.map(t => ({
              ...t,
              data: definition.dataSources.find(ds => ds.id === t.dataSourceId).data,
            })),
          });
        }),
      });
    } catch (err) {
      openSnack(err.message, 'error');
    }
  };

  const saveAsCopy = () => {
    const copy = { ...definition };
    delete copy._id;
    saveAndClose(copy);
    setOpen(false);
  };

  const actions = [
    { name: 'Save', icon: <Save />, fn: () => { save(definition); setOpen(false); } },
    { name: 'Save & Close', icon: <Save />, fn: () => { saveAndClose(definition); setOpen(false); } },
    { name: 'Test', icon: <Description />, fn: () => { runTest(definition); setOpen(false); } },
    { name: 'Test with Stored Data', icon: <Description />, fn: () => { runTwsd(); setOpen(false); } },
  ];

  if (definition._id) actions.splice(2, 0, { name: 'Save as Copy', icon: <FileCopy />, fn: saveAsCopy });

  return (
    <div className={classes.floating}>
      {/* <Backdrop open={open} /> */}
      <SpeedDial
        ariaLabel=""
        ButtonProps={{ size: 'small' }}
        icon={<Menu />}
        direction="down"
        onBlur={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        open={open}
        className={classes.speedDial}
      >
        {actions.map(action => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={<span className={classes.tooltip}>{action.name}</span>}
            tooltipOpen
            onClick={action.fn}
          />
        ))}

      </SpeedDial>
      <br />
      {/* {saving && <CircularProgress size={30} className={classes.progress} />} */}
      {/* {testing && <CircularProgress size={30} className={classes.progress2} />} */}
    </div>
  );
};

Actions.propTypes = {
  definition: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    reportNameType: PropTypes.oneOf(['Same as Definition', 'Static', 'Dynamic']),
    reportName: PropTypes.string,
    reportFilenameType: PropTypes.oneOf(['Same as Definition', 'Same as Report', 'Static', 'Dynamic']),
    reportFilename: PropTypes.string,
    description: PropTypes.string,
    dept: PropTypes.string,
    requestedBy: PropTypes.string,
    exceptionsReport: PropTypes.bool,
    dataSources: PropTypes.arrayOf(PropTypes.shape({
      ordinal: PropTypes.number,
      type: PropTypes.string,
      value: PropTypes.string,
      database: PropTypes.string,
    })),
    sheets: PropTypes.arrayOf(PropTypes.shape()),
    reportNameDataSourceId: PropTypes.number,
    filenameDataSourceId: PropTypes.number,
  }).isRequired,
};

export default Actions;
