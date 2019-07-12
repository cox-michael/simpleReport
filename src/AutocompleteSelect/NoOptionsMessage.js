/* eslint-disable react/prop-types */
import React from 'react';
import Typography from '@material-ui/core/Typography';

const NoOptionsMessage = props => {
  const { selectProps, innerProps, children } = props;
  return (
    <Typography
      color="textSecondary"
      className={selectProps.classes.noOptionsMessage}
      {...innerProps}
    >
      {children}
    </Typography>
  );
};

export default NoOptionsMessage;
