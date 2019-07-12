/* eslint-disable react/prop-types */
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';

const Option = props => {
  const {
    innerRef, isFocused, isSelected, innerProps, children,
  } = props;
  return (
    <MenuItem
      buttonRef={innerRef}
      selected={isFocused}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400,
      }}
      {...innerProps}
    >
      {children}
    </MenuItem>
  );
};

export default Option;
