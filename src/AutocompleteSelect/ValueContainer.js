/* eslint-disable react/prop-types */
import React from 'react';

const ValueContainer = props => {
  const { selectProps, children } = props;
  return <div className={selectProps.classes.valueContainer}>{children}</div>;
};

export default ValueContainer;
