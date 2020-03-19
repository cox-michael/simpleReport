import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Backdrop,
  CircularProgress,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  centerScreen: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
  },
  center: {
    width: '100%',
    textAlign: 'center',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const Spinner = props => {
  const classes = useStyles();
  const {
    size, centerScreen, center: centerProp, message, backdrop,
  } = props;

  const center = message ? true : centerProp;

  if (backdrop) {
    return (
      <Backdrop open={backdrop} className={classes.backdrop}>
        <div className={classes[center && 'center']}>
          <div className={classes[centerScreen && 'centerScreen']}>
            <CircularProgress disableShrink size={size} />
            {message && (
              <div><Typography variant="caption" color="textSecondary">{message}</Typography></div>
            )}
          </div>
        </div>
      </Backdrop>
    );
  }

  return (
    <div className={classes[center && 'center']}>
      <div className={classes[centerScreen && 'centerScreen']}>
        <CircularProgress disableShrink size={size} />
        {message && (
          <div><Typography variant="caption" color="textSecondary">{message}</Typography></div>
        )}
      </div>
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.number,
  centerScreen: PropTypes.bool,
  center: PropTypes.bool,
  message: PropTypes.string,
  backdrop: PropTypes.bool,
};

Spinner.defaultProps = {
  size: 60,
  centerScreen: false,
  center: false,
  message: '',
  backdrop: false,
};

export default Spinner;
