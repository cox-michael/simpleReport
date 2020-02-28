/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Add, Delete } from '@material-ui/icons';
import classNames from 'classnames';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Input from '@material-ui/core/Input';
import Grid from '@material-ui/core/Grid';
import ListItemText from '@material-ui/core/ListItemText';

const useStyles = makeStyles(theme => ({
  layout: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing(1) * 3,
    marginRight: theme.spacing(1) * 3,
    [theme.breakpoints.up(800 + theme.spacing(1) * 3 * 2)]: {
      width: 800,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  iconSmall: {
    fontSize: 20,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const EditSchedules = props => {
  const classes = useStyles();
  const { schedules, dispatch } = props;
  const nav = ['schedules'];

  const handleChange = (idx, { target }) => {
    const value = target.type === 'checkbox' ? target.checked : target.value;
    schedules[idx][target.name] = value;
    dispatch([nav, schedules]);
  };

  const handleRemove = index => {
    dispatch([nav, schedules.splice(index, 1)]);
  };

  // handleTimeChange = (idx, { target }) => {
  //  const schedules = schedules
  //  const value = target.type === 'checkbox' ? target.checked : target.value;
  //  schedules[idx].time[target.name] = value;
  //  dispatch([nav, schedules]);
  // }

  const handleNewSchedule = () => {
    let i = 1;
    // eslint-disable-next-line no-loop-func
    while (schedules.some(schedule => schedule.name === `schedule${i}`)) {
      i += 1;
    }
    const name = `schedule${i}`;

    const updated = [
      ...schedules,
      {
        name,
        active: true,
        freq: '',
        time: [],
        weekday: [],
        day: [],
        month: [],
      },
    ];

    dispatch([nav, updated]);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  // eslint-disable-next-line no-plusplus, no-param-reassign
  const days = [...Array(31).keys()].map(n => ++n);
  days.splice(28, 0, 'Last day of the month');

  const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'];

  return (
    <main>
      <Typography component="h1" variant="h5" align="center">Schedules</Typography>
      {schedules.map((schedule, idx) => (
        <div key={idx}>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <div>
              <FormControlLabel
                style={{ marginTop: 18 }}
                control={(
                  <Checkbox
                    id="active"
                    name="active"
                    checked={schedule.active}
                    color="primary"
                    onChange={e => handleChange(idx, e)}
                  />
                )}
                label="Active"
              />
              <FormControl
                className={classes.formControl}
                disabled={!schedule.active}
              >
                <InputLabel htmlFor="freq-simple">Frequency</InputLabel>
                <Select
                  value={schedule.freq}
                  onChange={e => handleChange(idx, e)}
                  inputProps={{ name: 'freq', id: 'freq-simple' }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
              { schedule.freq === 'yearly' && (
              <FormControl
                className={classes.formControl}
                disabled={!schedule.active}
              >
                <InputLabel htmlFor="select-multiple-checkbox">Month</InputLabel>
                <Select
                  multiple
                  name="month"
                  value={schedule.month}
                  onChange={e => handleChange(idx, e)}
                  input={<Input id="select-multiple-checkbox" />}
                  renderValue={selected => selected.join(', ')}
                  MenuProps={MenuProps}
                >
                  {monthsArray.map(name => (
                    <MenuItem key={name} value={name}>
                      <Checkbox checked={schedule.month.indexOf(name) > -1} />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              )}
              { (schedule.freq === 'monthly' || schedule.freq === 'yearly') && (
              <FormControl
                className={classes.formControl}
                disabled={!schedule.active}
              >
                <InputLabel htmlFor="select-multiple-checkbox">Day of Month</InputLabel>
                <Select
                  multiple
                  name="day"
                  value={schedule.day}
                  onChange={e => handleChange(idx, e)}
                  input={<Input id="select-multiple-checkbox" />}
                  renderValue={selected => selected.join(', ')}
                  MenuProps={MenuProps}
                >
                  {days.map(day => (
                    <MenuItem key={day} value={day}>
                      <Checkbox checked={schedule.day.indexOf(day) > -1} />
                      <ListItemText primary={day} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              )}
              { schedule.freq === 'weekly' && (
              <FormControl
                className={classes.formControl}
                disabled={!schedule.active}
              >
                <InputLabel htmlFor="select-multiple-checkbox">Weekday</InputLabel>
                <Select
                  multiple
                  name="weekday"
                  value={schedule.weekday}
                  onChange={e => handleChange(idx, e)}
                  input={<Input id="select-multiple-checkbox" />}
                  renderValue={selected => selected.join(', ')}
                  MenuProps={MenuProps}
                >
                  {daysOfTheWeek.map(name => (
                    <MenuItem key={name} value={name}>
                      <Checkbox checked={schedule.weekday.indexOf(name) > -1} />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              )}
              { schedule.freq !== '' && (
              <FormControl
                className={classes.formControl}
                disabled={!schedule.active}
              >
                <InputLabel htmlFor="select-multiple-checkbox">Time of Day</InputLabel>
                <Select
                  multiple
                  name="time"
                  value={schedule.time}
                  onChange={e => handleChange(idx, e)}
                  input={<Input id="select-multiple-checkbox" />}
                  renderValue={selected => selected.join(', ')}
                  MenuProps={MenuProps}
                >
                  {['Morning', 'Afternoon', 'Evening'].map(name => (
                    <MenuItem key={name} value={name}>
                      <Checkbox checked={schedule.time.indexOf(name) > -1} />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              )}
            </div>
            <Button
              variant="outlined"
              color="primary"
              onClick={e => handleRemove(idx, e)}
            >
              <Delete className={classes.iconSmall} />
            </Button>
          </Grid>
          <br />
          <br />
          <Divider />
        </div>
      ))}

      <Button color="primary" onClick={handleNewSchedule}>
        <Add className={classNames(classes.leftIcon, classes.iconSmall)} />
        New schedule
      </Button>
    </main>
  );
};

EditSchedules.propTypes = {
  schedules: PropTypes.arrayOf(PropTypes.shape({
    time: PropTypes.number,
  })).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default EditSchedules;
