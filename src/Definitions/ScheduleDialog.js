import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Divider,
  Dialog,
  // DialogTitle,
  DialogContent,
  // DialogContentText,
  DialogActions,
  Typography,
} from '@material-ui/core';
import MaterialTable from 'material-table';
import cronstrue from 'cronstrue';
import { useFetch } from '../hooks';
import { formatDate } from '../utils';

const useStyles = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(2, 0, 1),
  },
}));

const ScheduleDialog = props => {
  const classes = useStyles();
  const { open, setScheduleDialogOpen, def: { _id, name } } = props;

  const [data, setData] = useState([]);
  const [getSchedules, schedulesLoading] = useFetch('getSchedules', setData);
  const [addSchedule, addingSchedule] = useFetch('addSchedule', setData);
  const [editSchedule, editingSchedule] = useFetch('editSchedule', setData);
  const [deleteSchedule, deletingSchedule] = useFetch('deleteSchedule', setData);

  useEffect(() => {
    if (open) getSchedules({ _id });
  }, [_id, open]);

  data.forEach(row => {
    if (row.disabled === undefined) row.disabled = false;
  });

  const tableProps = {
    title: name,
    isLoading: schedulesLoading || addingSchedule || deletingSchedule || editingSchedule,
    loadingType: 'linear',
    columns: [
      { title: 'Cron', field: 'repeatInterval', cellStyle: { whiteSpace: 'nowrap' } },
      {
        title: 'Translation',
        field: 'repeatInterval',
        editable: 'never',
        render: rowData => ((rowData && rowData.repeatInterval) ?
          cronstrue.toString(rowData.repeatInterval) :
          ''),
      },
      {
        title: 'Last',
        field: 'lastRunAt',
        editable: 'never',
        render: rowData => ((rowData && rowData.lastRunAt) ?
          formatDate(new Date(rowData.lastRunAt), 'mm/dd/yyyy at h:min0 ampm') :
          ''),
      },
      {
        title: 'Next',
        field: 'nextRunAt',
        editable: 'never',
        render: rowData => ((rowData && rowData.nextRunAt) ?
          formatDate(new Date(rowData.nextRunAt), 'mm/dd/yyyy at h:min0 ampm') :
          ''),
      },
      {
        title: 'Status',
        field: 'disabled',
        lookup: { false: 'Active', true: 'Paused' },
        initialEditValue: true,
        editable: 'onUpdate',
      },
      {
        title: 'Email To (optional)',
        field: 'data',
      },
    ],
    data,
    options: { search: false, paging: false },
    editable: {
      onRowAdd: newData => (addSchedule({ ...newData, _id })),
      onRowUpdate: newData => (editSchedule({ ...newData, defId: _id })),
      onRowDelete: oldData => (deleteSchedule({ ...oldData, defId: _id })),
    },
    localization: {
      body: {
        emptyDataSourceMessage: 'No schedules to display',
      },
    },
  };

  return (
    <Dialog {...{ open, onClose: () => setScheduleDialogOpen(false), maxWidth: 'lg' }}>
      <DialogContent>
        <MaterialTable {...tableProps} />
        <Divider className={classes.margin} />
        <div>
          <Typography variant="h6">
            Cron Syntax
          </Typography>
          <Typography>
            ┌───── minute (0 - 59)
            <br />
            │┌───── hour (0 - 23)
            <br />
            ││┌───── day of the month (1 - 31)
            <br />
            │││┌───── month (1 - 12)
            <br />
            ││││┌───── day of the week (0 - 7) (Sunday to Sunday)
            <br />
            │││││
            <br />
            * * * * *
            <br />
            Visit
            {' '}
            <a href="https://crontab.guru/" target="_blank" rel="noopener noreferrer">
              crontab.guru
            </a>
            {' '}
            for more help
          </Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setScheduleDialogOpen(false)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ScheduleDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setScheduleDialogOpen: PropTypes.func.isRequired,
  def: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
};

export default ScheduleDialog;
