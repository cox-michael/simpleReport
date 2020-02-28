import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(1),
  },
}));

const Test = props => {
  const classes = useStyles();
  const { filler } = props;

  console.log({ filler });

  return (
    <div className={classes.root}>React Functional Component</div>
  );
};

Test.propTypes = {
  filler: PropTypes.string,
};

Test.defaultProps = {
  filler: 'delete me',
};

export default Test;
