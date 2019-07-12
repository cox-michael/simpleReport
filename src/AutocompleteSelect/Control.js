/* eslint-disable react/prop-types */
import React from 'react';
import TextField from '@material-ui/core/TextField';

const inputComponent = ({ inputRef, ...props }) => (
  <div ref={inputRef} {...props} />
);

const Control = props => {
  const {
    selectProps, innerRef, children, innerProps,
  } = props;
  return (
    <TextField
      className={selectProps.classes.textField}
      InputProps={{
        inputComponent,
        inputProps: {
          className: selectProps.classes.input,
          inputRef: innerRef,
          children,
          ...innerProps,
        },
      }}
      {...selectProps.textFieldProps}
    />
  );
};

export default Control;
