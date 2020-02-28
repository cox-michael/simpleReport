import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';

const ToggleButton = props => {
  const {
    children, value, selected, setSelected, ...other
  } = props;

  const options = {
    ...other,
    variant: selected === value ? 'contained' : 'outlined',
    onClick: () => setSelected(value),
  };

  return (
    <Button {...options}>{children}</Button>
  );
};

ToggleButton.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  selected: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  setSelected: PropTypes.func,
};

ToggleButton.defaultProps = {
  selected: null,
  setSelected: () => {},
};

export default ToggleButton;
