import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Checkbox,
  Typography,
  FormControl,
  FormControlLabel,
  IconButton,
  TextField,
  Tooltip,
} from '@material-ui/core';
import {
  Help,
  ColorLens,
} from '@material-ui/icons';
import { Row } from '../components';
import { DefDispatch, FormatContext } from './Context';

const useStyles = makeStyles(theme => ({
  toolTipIcon: {
    marginLeft: theme.spacing(1),
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
  },
}));

const SelectTheme = props => {
  const classes = useStyles();
  const {
    _id,
    name,
    nameFormat,
    description,
    dept,
    requestedBy,
    exceptionsReport,
  } = props;
  const dispatch = useContext(DefDispatch);
  const { setFormatDialog } = useContext(FormatContext);

  const changeDef = e => {
    const { type, checked, value } = e.target;
    const input = type === 'checkbox' ? checked : value;
    dispatch([{}, { name: e.target.name, value: input }]);
  };

  const openFormatDialog = () => {
    setFormatDialog({
      dialogOpen: true,
      format: nameFormat,
      nav: {},
      name: 'nameFormat',
      sample: name,
    });
  };

  return (
    <>
      <Typography component="h1" variant="h5" align="center">
        {!_id ? 'New Definition' : 'Edit Definition'}
      </Typography>
      <Row alignItems="flex-end">
        <TextField
          name="name"
          label="Report Name"
          value={name}
          onChange={changeDef}
          fullWidth
        />
        <IconButton
          color="primary"
          onClick={openFormatDialog}
        >
          <ColorLens />
        </IconButton>
      </Row>
      <FormControl margin="normal" required fullWidth>
        <TextField
          name="description"
          label="Report Description"
          multiline
          rowsMax="9"
          value={description}
          onChange={changeDef}
        />
      </FormControl>
      <br />
      <FormControl margin="normal" required fullWidth>
        <TextField
          name="dept"
          label="Department (automatic once requester tied to AD)"
          value={dept}
          onChange={changeDef}
        />
      </FormControl>
      <FormControl margin="normal" required fullWidth>
        <TextField
          name="requestedBy"
          label="Requested By"
          value={requestedBy}
          onChange={changeDef}
        />
      </FormControl>
      <Tooltip
        title={(
          <Typography variant="body2">
            The report will only be saved & emailed if at least one of
            the queries returns data
          </Typography>
        )}
      >
        <FormControlLabel
          control={(
            <Checkbox
              name="exceptionsReport"
              checked={exceptionsReport}
              color="primary"
              onChange={changeDef}
            />
          )}
          label={(
            <span>
              Exceptions Report
              <Help className={classes.toolTipIcon} />
            </span>
          )}
        />
      </Tooltip>
    </>
  );
};

SelectTheme.propTypes = {
  _id: PropTypes.string,
  name: PropTypes.string,
  nameFormat: PropTypes.shape(),
  description: PropTypes.string,
  dept: PropTypes.string,
  requestedBy: PropTypes.string,
  exceptionsReport: PropTypes.bool,
};

SelectTheme.defaultProps = {
  _id: null,
  name: '',
  nameFormat: {},
  description: '',
  dept: '',
  requestedBy: '',
  exceptionsReport: false,
};

export default SelectTheme;
