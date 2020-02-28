import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  // CircularProgress,
} from '@material-ui/core';
import {
  Save,
  Description,
} from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { useFetch } from '../hooks';

const useStyles = makeStyles(theme => ({
  leftSmallIcon: {
    marginRight: theme.spacing(1),
    fontSize: 20,
  },
  button: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  floating: {
    position: 'fixed',
    top: theme.spacing(11),
    right: theme.spacing(3),
    zIndex: 100,
  },
  progress: {
    // color: green[500],
    position: 'relative',
    top: -78, // 15 without <br />
    left: 43, // -60 without <br />
    zIndex: 10000,
  },
  progress2: {
    position: 'relative',
    top: -34, // 15 without <br />
    left: 43, // -60 without <br />
    zIndex: 10000,
  },
}));

const Actions = props => {
  const classes = useStyles();
  const { definition } = props;
  const history = useHistory();

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

  const [save, saving] = useFetch('addDefinition', () => history.push('/'));
  const [runTest, testing] = useFetch('runTest', downloadFile);
  const [runTestwsd, testingwsd] = useFetch('runTestWithStoredData', downloadFile);

  const runTwsd = () => {
    runTestwsd({
      report: {
        ...definition,
        // eslint-disable-next-line react/prop-types
        sheets: definition.sheets.map(s => {
          if (s.type === 'Grouping') {
            console.log(s.type);
            return ({
              ...s,
              data: definition.dataSources.find(ds => ds.id === s.dataSourceId).data,
            });
          }
          console.log(s.type);
          return ({
            ...s,
            tables: s.tables.map(t => ({
              ...t,
              data: definition.dataSources.find(ds => ds.id === t.dataSourceId).data,
            })),
          });
        }),
      },
    });
  };

  return (
    <div className={classes.floating}>
      <Button
        variant="contained"
        color="primary"
        disabled={saving}
        className={classes.button}
        onClick={() => save(definition)}
      >
        <Save className={classes.leftSmallIcon} />
        Save
      </Button>
      <br />
      <Button
        variant="contained"
        color="secondary"
        disabled={testing}
        className={classes.button}
        onClick={() => runTest(definition)}
      >
        <Description className={classes.leftSmallIcon} />
        Test
      </Button>
      <br />
      <Button
        variant="contained"
        color="secondary"
        disabled={testingwsd}
        className={classes.button}
        onClick={runTwsd}
      >
        <Description className={classes.leftSmallIcon} />
        Test with Stored Data
      </Button>
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
  }).isRequired,
};

export default Actions;
