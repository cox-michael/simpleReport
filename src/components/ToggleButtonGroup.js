import React, { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import ButtonGroup from '@material-ui/core/ButtonGroup';

const ToggleButtonGroup = props => {
  const {
    value, onChange, children, ...other
  } = props;

  return (
    <ButtonGroup {...other}>
      {Children.map(children, child => cloneElement(child, {
        selected: value,
        setSelected: onChange,
      }))}
    </ButtonGroup>
  );
};

ToggleButtonGroup.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default ToggleButtonGroup;
