import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import {
  Delete,
  Description,
  Edit,
  Notifications,
  NotificationsActive,
  NotificationsNone,
  NotificationsOff,
  Pageview,
  Schedule,
  Star,
  StarBorder,
  Folder,
} from '@material-ui/icons';
import ScheduleDialog from './ScheduleDialog';
import MoveDialog from './MoveDialog';
import { Spinner } from '../components';
import { SessionContext } from '../Session';
import { useFetch } from '../hooks';

const useStyles = makeStyles(theme => ({
  icon: {
    marginRight: theme.spacing(1),
  },
}));

const DetailPanel = props => {
  const classes = useStyles();
  const {
    _id,
    name,
    description,
    starred,
    subscribed,
    notify,
    reload,
  } = props;

  const { openDefReports } = useContext(SessionContext);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);

  const downloadFile = data => {
    const buf = Buffer.from(JSON.parse(data.buffer).data);
    const blob = new Blob([buf]);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.filename || name}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const [runReport, running] = useFetch('runReport', downloadFile);
  const [subscribe, subscribeLoading] = useFetch('subscribe', () => reload());
  const [unsubscribe, unsubscribeLoading] = useFetch('unsubscribe', () => reload());
  const [addNotify, notifyLoading] = useFetch('notify', () => reload());
  const [unnotify, unnotifyLoading] = useFetch('unnotify', () => reload());
  const [star, starLoading] = useFetch('star', () => reload());
  const [unstar, unstarLoading] = useFetch('unstar', () => reload());
  const [del, deleting] = useFetch('deleteDefinition', () => reload());


  const history = useHistory();

  const payload = { reportId: _id };

  const def = {
    _id,
    name,
    description,
  };

  if (running) return <Spinner center centerScreen />;

  return (
    <>
      <ButtonGroup size="small" color="secondary">
        <Button onClick={() => openDefReports(def)}>
          <Pageview className={classes.icon} />
          View Saved Reports
        </Button>

        {starred ? (
          <Button onClick={() => unstar(payload)} disabled={unstarLoading}>
            <StarBorder className={classes.icon} />
            Remove from starred
          </Button>
        ) : (
          <Button onClick={() => star(payload)} disabled={starLoading}>
            <Star className={classes.icon} />
            Add to starred
          </Button>
        )}

        {subscribed ? (
          <Button onClick={() => unsubscribe(payload)} disabled={unsubscribeLoading}>
            <NotificationsNone className={classes.icon} />
            Unsubscribe
          </Button>
        ) : (
          <Button onClick={() => subscribe(payload)} disabled={subscribeLoading}>
            <Notifications className={classes.icon} />
            Subscribe
          </Button>
        )}

        {notify ? (
          <Button onClick={() => unnotify(payload)} disabled={notifyLoading}>
            <NotificationsOff className={classes.icon} />
            Turn off immediate notification
          </Button>
        ) : (
          <Button onClick={() => addNotify(payload)} disabled={unnotifyLoading}>
            <NotificationsActive className={classes.icon} />
            Get notified immediately
          </Button>
        )}

        <Button onClick={() => setMoveDialogOpen(true)}>
          <Folder className={classes.icon} />
          Move
        </Button>

        <Button onClick={() => setScheduleDialogOpen(true)}>
          <Schedule className={classes.icon} />
          Schedule
        </Button>

        <Button onClick={() => history.push(`/editDefinition/${_id}`)}>
          <Edit className={classes.icon} />
          Edit Report Definition
        </Button>

        <Button onClick={() => runReport({ _id })}>
          <Description className={classes.icon} />
          Run Report
        </Button>

        <Button onClick={() => setDeleteDialogOpen(true)}>
          <Delete className={classes.icon} />
          Delete
        </Button>
      </ButtonGroup>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Report Definition?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete
            {' '}
            <strong>
              {name}
            </strong>
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="default" autoFocus>
            No
          </Button>
          <Button onClick={() => del({ _id })} color="primary" disabled={deleting}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <ScheduleDialog {...{ open: scheduleDialogOpen, setScheduleDialogOpen, def }} />

      <MoveDialog {...{
        moveDialogOpen, setMoveDialogOpen, def, onMove: reload,
      }}
      />
    </>
  );
};

DetailPanel.propTypes = {
  _id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  starred: PropTypes.number,
  subscribed: PropTypes.number,
  notify: PropTypes.number,
  reload: PropTypes.func.isRequired,
};

DetailPanel.defaultProps = {
  starred: false,
  subscribed: false,
  notify: false,
  description: '',
};

export default DetailPanel;
