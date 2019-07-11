/* eslint-disable react/prop-types */
import React from 'react';
import Typography from '@material-ui/core/Typography';

const SingleValue = props => {
  const { selectProps, innerProps, children } = props;
  return (
    <Typography className={selectProps.classes.singleValue} {...innerProps}>
      {children}
    </Typography>
  );
};

export default SingleValue;
