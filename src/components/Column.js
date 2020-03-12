import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: ({ alignItems }) => alignItems,
    // justifyContent: ({ justifyContent }) => justifyContent,
  },
});

const Column = props => {
  const { children, alignItems, justifyContent } = props;
  const classes = useStyles({ alignItems, justifyContent });

  return <div className={classes.root}>{children}</div>;
};

Column.propTypes = {
  children: PropTypes.node.isRequired,
  alignItems: PropTypes.oneOf([
    'stretch',
    'flex-start',
    'flex-end',
    'center',
    'baseline',
    'first baseline',
    'last baseline',
    'start',
    'end',
    'self-start',
    'self-end',
  ]),
  justifyContent: PropTypes.oneOf([
    'flex-start',
    'flex-end',
    'center',
    'space-between',
    'space-around',
    'space-evenly',
    'start',
    'end',
    'left',
    'right',
  ]),
};

Column.defaultProps = {
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
};

export default Column;
