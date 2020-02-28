import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Link, useHistory } from 'react-router-dom';
import {
  Button,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core/';
import {
  Add as AddIcon,
  Notifications,
  NotificationsActive,
  Star,
} from '@material-ui/icons';
import MaterialTable from 'material-table';
import { Row, Spinner } from '../components';
import { SessionContext } from '../Session';
import { useFetch } from '../hooks';
import DetailPanel from './DetailPanel';
import FolderTree from './FolderTree';

const useStyles = makeStyles(theme => ({
  button: {
    marginLeft: theme.spacing(1),
  },
  buttons: {
    marginBottom: theme.spacing(1),
    textAlign: 'right',
  },
  paper: {
    marginBottom: theme.spacing(1) * 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    padding: `${theme.spacing(1) * 2}px ${theme.spacing(1) * 3}px ${theme.spacing(1) * 3}px`,
  },
  paperDesc: {
    marginBottom: theme.spacing(1) * 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    padding: `${theme.spacing(1) * 2}px ${theme.spacing(1) * 3}px ${theme.spacing(1) * 3}px`,
    backgroundColor: 'lightgray',
  },
  card: {
    minWidth: 275,
  },
  icon: {
    marginBottom: -5,
  },
  icons: {
    minWidth: 60,
    marginRight: theme.spacing(1),
  },
  treeContainer: {
    minWidth: 200,
    border: '1px solid darkgray',
    minHeight: '50vh',
    padding: theme.spacing(1),
  },
}));

const Definitions = props => {
  const classes = useStyles();
  const theme = useTheme();
  const { match, filter } = props;
  const { openReport, loginState } = useContext(SessionContext);
  const history = useHistory();
  const [reports, setDefs] = useState([]);
  const [selected, setSelected] = useState();
  // const [keep, setKeep] = useState('');
  // const keep = '';
  // const [loading, setLoading] = useState(true);
  const [reload, defsLoading] = useFetch('getDefs', setDefs, 'GET');

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    if (!defsLoading && match && match.params.definition_id) {
      // eslint-disable-next-line camelcase
      const { definition_id } = match.params;
      // eslint-disable-next-line camelcase
      const report = reports.find(r => r._id === definition_id);
      openReport(report);
    }
  }, [reports]);

  if (defsLoading) return <Spinner centerScreen />;

  // const depts = [...new Set(reports.map(report => report.dept))];

  const cleanDate = mongoDate => {
    const format = { hour: '2-digit', minute: '2-digit' };
    let date = new Date(mongoDate);
    date = date.toLocaleDateString([], format);
    return date.replace(',', ' at');
  };

  const columns = [
    {
      title: 'Name',
      field: 'name',
      // eslint-disable-next-line react/display-name
      render: rowData => (
        <Row>
          <div className={classes.icons}>
            {!!rowData.starred && (
              <Tooltip title={<Typography variant="body2">You have starred this report</Typography>}>
                <Star color="primary" fontSize="small" />
              </Tooltip>
            )}
            {!!rowData.subscribed && (
              <Tooltip title={<Typography variant="body2">You are subscribed to this report</Typography>}>
                <Notifications color="primary" fontSize="small" />
              </Tooltip>
            )}
            {!!rowData.notify && (
              <Tooltip title={(
                <Typography variant="body2">
                  You will receive a notification immediately after this report runs
                </Typography>
              )}
              >
                <NotificationsActive color="primary" fontSize="small" />
              </Tooltip>
            )}
          </div>
          <Typography variant="body1">
            {rowData.name}
          </Typography>
        </Row>
      ),
      cellStyle: { padding: theme.spacing(0, 1), minWidth: 300 },
      headerStyle: { paddingLeft: 68 },
    },
    {
      title: 'Description',
      field: 'description',
      cellStyle: { padding: theme.spacing(0, 1), maxWidth: 1000 },
      headerStyle: { paddingLeft: 0 },
    },
    {
      title: 'Last Run',
      field: 'lastRun',
      render: rowData => (rowData.lastRun ? cleanDate(rowData.lastRun) : 'Has not run'),
      cellStyle: { padding: theme.spacing(0, 1), whiteSpace: 'nowrap' },
    },
  ];

  const options = {
    paging: false,
    actionsColumnIndex: 2,
    // detailPanelColumnAlignment: 'right',
  };

  if (!reports.length) {
    return (
      <Paper className={classes.paper}>
        <Typography>
          {`You have not ${filter} `}
          {filter === 'starred' ? (
            <span><Star color="primary" className={classes.icon} /></span>
          ) : (
            <span>
              <Notifications color="primary" className={classes.icon} />
              {' to '}
            </span>
          )}
          {' any reports yet. Go back to '}
          <Link to={process.env.API_URL}>all reports</Link>
          {' to add some.'}
        </Typography>
      </Paper>
    );
  }

  console.log({ selected });

  return (
    <Row>
      <FolderTree onSelect={_id => setSelected(_id)} />

      <Row justifyContent="center" style={{ width: '100%' }}>
        <>
          { !reports.length && (
            <Paper className={classes.paper}>
              <Typography>
                It looks like you do not have access to any reports yet.
              </Typography>
            </Paper>
          )}
          { (
            !!loginState.permissions &&
            !!loginState.permissions.sitewide &&
            !!loginState.permissions.sitewide.includes['Create/Edit Report Definitions']
          ) && (
            <div className={classes.buttons}>
              <Link
                to={`${process.env.API_URL}createNewReport`}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="contained" color="primary" className={classes.button}>
                  <AddIcon />
                  Create New Report
                </Button>
              </Link>
            </div>
          )}
          <MaterialTable
            title="Reports"
            style={{ width: '100%' }}
            columns={columns}
            data={reports.filter(r => r.parentId === selected)}
            options={options}
            detailPanel={[
              {
                icon: 'more_horiz',
                tooltip: 'Menu',
                // eslint-disable-next-line react/display-name
                render: rowData => <DetailPanel {...{ ...rowData, reload }} />,
              },
            ]}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
            actions={[
              {
                icon: 'add',
                tooltip: 'Create New Report Definition',
                isFreeAction: true,
                onClick: () => history.push('/editDefinition/new'),
              },
            ]}
          />
        </>
      </Row>
    </Row>
  );
};

Definitions.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  match: PropTypes.object.isRequired,
  filter: PropTypes.string,
};

Definitions.defaultProps = {
  filter: null,
};

export default Definitions;
