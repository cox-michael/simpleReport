import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  CircularProgress,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
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
}));

const Spinner = props => {
  const classes = useStyles();
  const {
    size, centerScreen, center: centerProp, message,
  } = props;

  const center = message ? true : centerProp;

  return (
    <div className={classes[center && 'center']}>
      <div className={classes[centerScreen && 'centerScreen']}>
        <CircularProgress size={size} />
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
};

Spinner.defaultProps = {
  size: 60,
  centerScreen: false,
  center: false,
  message: '',
};

export default Spinner;
