import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = () => ({
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
});

const Spinner = props => {
  const {
    classes, size, centerScreen, center,
  } = props;

  return (
    <div className={classes[center && 'center']}>
      <CircularProgress
        size={size}
        className={classes[centerScreen && 'centerScreen']}
      />
    </div>
  );
};

Spinner.propTypes = {
  classes: PropTypes.object.isRequired,
  size: PropTypes.number,
  centerScreen: PropTypes.bool,
  center: PropTypes.bool,
};

Spinner.defaultProps = {
  size: 60,
  centerScreen: false,
  center: false,
};

export default withStyles(styles)(Spinner);
