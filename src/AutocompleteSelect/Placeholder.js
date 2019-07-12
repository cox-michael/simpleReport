/* eslint-disable react/prop-types */
import React from 'react';
import Typography from '@material-ui/core/Typography';

const Placeholder = props => {
  const { selectProps, innerProps, children } = props;
  return (
    <Typography
      color="textSecondary"
      className={selectProps.classes.placeholder}
      {...innerProps}
    >
      {children}
    </Typography>
  );
};

export default Placeholder;
