import React from 'react';
// import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
  button: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  paper: {
    marginBottom: theme.spacing(1) * 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    padding: `${theme.spacing(1) * 4}px ${theme.spacing(1) * 6}px ${theme.spacing(1) * 6}px`,
    textAlign: 'center',
  },
}));

const NotPermitted = () => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Typography variant="h5">Oops. You are not permitted access.</Typography>
    </Paper>
  );
};

// NotPermitted.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

export default NotPermitted;
