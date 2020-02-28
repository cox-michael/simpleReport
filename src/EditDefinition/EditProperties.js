import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Checkbox,
  Typography,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
} from '@material-ui/core';
import {
  Help,
  ColorLens,
} from '@material-ui/icons';
import { Row, Spinner } from '../components';
import { DefDispatch, DefContext, FormatContext } from './Context';
import { SessionContext } from '../Session';

const useStyles = makeStyles(theme => ({
  toolTipIcon: {
    marginLeft: theme.spacing(1),
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  formControl: {
    marginTop: theme.spacing(1),
    minWidth: 100,
  },
  select: {
    minWidth: 200,
  },
  marginTop: {
    marginTop: theme.spacing(1),
  },
}));

const EditProperties = props => {
  const classes = useStyles();
  const {
    _id,
    name,
    themeId,
    nameFormat,
    description,
    dept,
    requestedBy,
    exceptionsReport,
    dynamicReportName,
    dataSourceId,
  } = props;
  const { themes, getThemes, themesLoading } = useContext(SessionContext);
  const dispatch = useContext(DefDispatch);
  const { setFormatDialog } = useContext(FormatContext);
  let { dataSources } = useContext(DefContext);
  const { resources, getResources } = useContext(SessionContext);
  if (!dataSources) dataSources = [];

  useEffect(() => {
    if (themes === null) getThemes();
    if (resources === null) getResources();
  }, []);

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

  if (themesLoading || themes === null) return <Spinner center centerScreen />;

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

      <Row className={classes.marginTop} alignItems="flex-end">
        <Tooltip
          title={(
            <Typography variant="body2">
              Use a data source as the report name.
              The first column of the first row of results will be used.
            </Typography>
          )}
        >
          <FormControlLabel
            control={(
              <Checkbox
                name="dynamicReportName"
                checked={dynamicReportName}
                color="primary"
                onChange={changeDef}
              />
            )}
            className={classes.marginTop}
            label={(
              <span>
                Dynamic Report Name
                <Help className={classes.toolTipIcon} />
              </span>
            )}
          />
        </Tooltip>
        {dynamicReportName && (
          <FormControl className={classes.select}>
            <InputLabel htmlFor="dataSourceId">Data Source</InputLabel>
            <Select
              value={dataSourceId}
              onChange={changeDef}
              inputProps={{ name: 'dataSourceId' }}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {dataSources.map(ds => (
                <MenuItem key={ds.id} value={ds.id}>
                  {ds.type === 'Query' ? ds.name : resources.find(r => r._id === ds.value).name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Row>

      <TextField
        name="description"
        label="Report Description"
        multiline
        rowsMax="9"
        value={description}
        onChange={changeDef}
        className={classes.marginTop}
      />
      <TextField
        name="dept"
        label="Department (automatic once requester tied to AD)"
        value={dept}
        onChange={changeDef}
        fullWidth
        className={classes.marginTop}
      />
      <TextField
        name="requestedBy"
        label="Requested By"
        value={requestedBy}
        onChange={changeDef}
        fullWidth
        className={classes.marginTop}
      />
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
          className={classes.marginTop}
          label={(
            <span>
              Exceptions Report
              <Help className={classes.toolTipIcon} />
            </span>
          )}
        />
      </Tooltip>
      <FormControl className={classes.marginTop}>
        <InputLabel htmlFor="type">Theme</InputLabel>
        <Select
          value={themeId}
          onChange={changeDef}
          inputProps={{ name: 'themeId' }}
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {themes.map(t => (
            <MenuItem value={t._id} key={t._id}>{t.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

EditProperties.propTypes = {
  _id: PropTypes.string,
  name: PropTypes.string,
  themeId: PropTypes.string,
  nameFormat: PropTypes.shape(),
  description: PropTypes.string,
  dept: PropTypes.string,
  requestedBy: PropTypes.string,
  exceptionsReport: PropTypes.bool,
  dynamicReportName: PropTypes.bool,
  dataSourceId: PropTypes.number,
};

EditProperties.defaultProps = {
  _id: null,
  name: '',
  themeId: '',
  nameFormat: {},
  description: '',
  dept: '',
  requestedBy: '',
  exceptionsReport: false,
  dynamicReportName: false,
  dataSourceId: null,
};

export default EditProperties;
