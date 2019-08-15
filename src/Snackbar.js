import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
// import WarningIcon from '@material-ui/icons/Warning';
// import InfoIcon from '@material-ui/icons/Info';
// import red from '@material-ui/core/colors/red';
import amber from '@material-ui/core/colors/amber';
import teal from '@material-ui/core/colors/teal';

const useStyles = makeStyles(theme => ({
  success: {
    backgroundColor: teal[400],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    // backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
  },
}));

const Snack = props => {
  const classes = useStyles();
  const {
    open, closeSnack, type, msg, autohide,
  } = props;

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={open}
      autoHideDuration={autohide}
      onClose={closeSnack}
      ContentProps={{ 'aria-describedby': 'message-id' }}
    >
      <SnackbarContent
        className={classes[type]}
        message={(
          <span id="message-id" className={classes.message}>
            {type === 'success' && <CheckCircleIcon className={classes.icon} />}
            {type === 'error' && <ErrorIcon className={classes.icon} />}
            {msg}
          </span>
        )}
        action={[
          <IconButton key="close" onClick={closeSnack}>
            <CloseIcon />
          </IconButton>,
        ]}
      />
    </Snackbar>
  );
};

Snack.propTypes = {
  open: PropTypes.bool.isRequired,
  closeSnack: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info']),
  msg: PropTypes.string.isRequired,
  autohide: PropTypes.number,
};

Snack.defaultProps = {
  autohide: 6000,
};

Snack.defaultProps = {
  type: 'info',
};

export default Snack;
