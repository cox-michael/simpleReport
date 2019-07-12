/* eslint-disable react/prop-types */
import React from 'react';
import Paper from '@material-ui/core/Paper';

const Menu = props => {
  const { selectProps, innerProps, children } = props;
  return (
    <Paper square className={selectProps.classes.paper} {...innerProps}>
      {children}
    </Paper>
  );
};

export default Menu;
