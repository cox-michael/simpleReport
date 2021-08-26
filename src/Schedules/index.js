import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Divider,
  Typography,
} from '@material-ui/core';
import MaterialTable from 'material-table';
import cronstrue from 'cronstrue';
import { useFetch } from '../hooks';
import { formatDate } from '../utils';
import { Column, Row, Spinner } from '../components';

const useStyles = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(2, 0, 1),
  },
}));

const Schedules = () => {
  const classes = useStyles();
  // const { open, def: { _id, name } } = props;

  const [data, setData] = useState([]);
  const [getSchedules, schedulesLoading] = useFetch('getAllSchedules', setData);
  // const [addSchedule, addingSchedule] = useFetch('addSchedule', setData);
  const [editSchedule, editingSchedule] = useFetch('editSchedule', () => getSchedules());
  const [deleteSchedule, deletingSchedule] = useFetch('deleteSchedule', () => getSchedules());

  useEffect(() => {
    getSchedules();
  }, []);

  if (schedulesLoading) return <Spinner centerScreen />;

  data.forEach(row => {
    if (row.disabled === undefined) row.disabled = false;
  });

  const tableProps = {
    title: 'Schedules',
    isLoading: schedulesLoading || deletingSchedule || editingSchedule,
    loadingType: 'linear',
    columns: [
      { title: 'Name', field: 'defName' },
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
    options: { paging: false },
    editable: {
      // onRowAdd: newData => (addSchedule({ ...newData, _id })),
      onRowUpdate: newData => (editSchedule({ ...newData, defId: newData.name })),
      onRowDelete: oldData => (deleteSchedule({ ...oldData, defId: oldData.name })),
    },
    localization: {
      body: {
        emptyDataSourceMessage: 'No schedules to display',
      },
    },
  };

  return (
    <Row>
      <Column>
        <MaterialTable {...tableProps} />
        <Divider className={classes.margin} />
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
      </Column>
    </Row>
  );
};

// Schedules.propTypes = {
//   open: PropTypes.bool.isRequired,
//   setSchedulesOpen: PropTypes.func.isRequired,
//   def: PropTypes.shape({
//     _id: PropTypes.string,
//     name: PropTypes.string,
//   }).isRequired,
// };

export default Schedules;
