import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import Control from './Control';
import Menu from './Menu';
import NoOptionsMessage from './NoOptionsMessage';
import Option from './Option';
import Placeholder from './Placeholder';
import SingleValue from './SingleValue';
import ValueContainer from './ValueContainer';

const styles = theme => ({
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  noOptionsMessage: {
    padding: `${theme.spacing(1)}px ${theme.spacing(1) * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
    width: 300,
  },
  textField: {
    width: 300,
  },
});

const components = {
  Control,
  Menu,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

const AutocompleteSelect = props => {
  const {
    classes, suggestions, onChange, loading, value, onInputChange,
  } = props;

  const thisSuggestions = suggestions.map(suggestion => ({
    value: suggestion,
    label: `${suggestion.displayName} (${suggestion.sAMAccountName})`,
  }));

  return (
    <Select
      classes={classes}
      options={thisSuggestions}
      components={components}
      value={value}
      onChange={onChange}
      onInputChange={onInputChange}
      placeholder="Enter a name or username"
      isLoading={loading}
      loadingMessage={() => 'Loading...'}
    />
  );
};

AutocompleteSelect.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  suggestions: PropTypes.array, // eslint-disable-line
  loading: PropTypes.bool,
};

AutocompleteSelect.defaultProps = {
  suggestions: [],
  loading: false,
};

export default withStyles(styles, { withTheme: true })(AutocompleteSelect);
