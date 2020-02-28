import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {
  Star,
  StarBorder,
  Notifications,
  NotificationsActive,
  NotificationsNone,
} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
// import { SessionContext } from './Session';
import { useFetch } from '../hooks';
import { SessionContext } from '../Session';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(1) * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  iconSmall: {
    fontSize: 20,
  },
  noWrap: {
    whiteSpace: 'nowrap',
  },
}));

const cleanDate = mongoDate => {
  const format = { hour: '2-digit', minute: '2-digit' };
  let date = new Date(mongoDate);
  date = date.toLocaleDateString([], format);
  return date.replace(',', ' at');
};

const DefinitionsTable = props => {
  const classes = useStyles();
  const { reports, reload } = props;
  const { openReport } = useContext(SessionContext);
  const [hoveredReport, setHoveredReport] = useState('');
  const [subscribe, subscribeLoading] = useFetch('subscribe', () => reload(hoveredReport));
  const [unsubscribe, unsubscribeLoading] = useFetch('unsubscribe', () => reload(hoveredReport));
  const [notify, notifyLoading] = useFetch('notify', () => reload(hoveredReport));
  const [star, starLoading] = useFetch('star', () => reload(hoveredReport));
  const [unstar, unstarLoading] = useFetch('unstar', () => reload(hoveredReport));

  console.log({
    subscribeLoading,
    unsubscribeLoading,
    notifyLoading,
    starLoading,
    unstarLoading,
  });

  console.log({ reports });

  const handleMouseEnter = rowId => setHoveredReport(rowId);

  const handleMouseLeave = () => setHoveredReport('');

  return (
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell padding="none" />
          <TableCell>Name</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Last Run</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {reports.map(row => (
          <TableRow
            key={row._id}
            hover
            onMouseEnter={e => handleMouseEnter(row._id, e)}
            onMouseLeave={handleMouseLeave}
          >
            <TableCell padding="none" className={classes.noWrap} width="96px" height="49px">
              <IconButton
                color="primary"
                onClick={row.starred ? unstar : star}
                style={{ visibility: (row._id !== hoveredReport && !row.starred) ? 'hidden' : 'inherit' }}
              >
                { row.starred ? <Star /> : <StarBorder /> }
              </IconButton>
              {!row.subscribed && (
                <IconButton
                  color="primary"
                  onClick={subscribe}
                  style={{ visibility: row._id !== hoveredReport ? 'hidden' : 'inherit' }}
                >
                  <NotificationsNone />
                </IconButton>
              )}
              {!!row.subscribed && !row.notify && (
                <IconButton
                  color="primary"
                  onClick={notify}
                >
                  <Notifications />
                </IconButton>
              )}
              {!!row.subscribed && !!row.notify && (
                <IconButton
                  color="primary"
                  onClick={unsubscribe}
                >
                  <NotificationsActive />
                </IconButton>
              )}
            </TableCell>
            <TableCell className={classes.noWrap} component="th" scope="row">
              <Button onClick={() => openReport(row)}>
                {row.name}
              </Button>
            </TableCell>
            <TableCell>{row.description}</TableCell>
            <TableCell className={classes.noWrap}>
              {row.lastRun ? cleanDate(row.lastRun) : 'Has not run'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

DefinitionsTable.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  reports: PropTypes.array.isRequired,
  reload: PropTypes.func.isRequired,
};

export default DefinitionsTable;
