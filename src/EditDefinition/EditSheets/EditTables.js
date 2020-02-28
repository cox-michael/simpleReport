/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  Add,
  ColorLens,
  Delete,
  ArrowUpward,
  ArrowDownward,
  Functions,
} from '@material-ui/icons';
import RowBandingDialog from '../RowBandingDialog';
import TotalsRowDialog from '../TotalsRowDialog';
import Row from '../../components/Row';
import { ToggleButton, ToggleButtonGroup, Spinner } from '../../components';
import { SessionContext } from '../../Session';
import { DefDispatch, DefContext, FormatContext } from '../Context';

const useStyles = makeStyles(theme => ({
  leftSmallIcon: {
    marginRight: theme.spacing(1),
    fontSize: 20,
  },
  iconSmall: {
    fontSize: 20,
  },
  select: {
    minWidth: 200,
  },
  gpCol: {
    minWidth: 200,
    marginLeft: theme.spacing(1),
  },
  btnGp: {
    margin: theme.spacing(1, 0, 0, 1),
  },
  marginBottom: {
    marginBottom: theme.spacing(1),
  },
  marginTop: {
    marginTop: theme.spacing(1),
  },
}));

const blankTable = {
  name: 'table1',
  type: 'Single',
  printTableName: true,
  description: '',
  dataSourceId: '',
};

const EditTables = props => {
  const classes = useStyles();
  const { sheetIndex, tables } = props;
  const dispatch = useContext(DefDispatch);
  let { dataSources } = useContext(DefContext);
  const { resources, getResources, resourcesLoading } = useContext(SessionContext);
  const { setFormatDialog } = useContext(FormatContext);
  if (!dataSources) dataSources = [];

  const [rowBandingDialogOpen, setRowBandingDialogOpen] = useState(false);
  const [totalsRowDialogOpen, setTotalsRowDialogOpen] = useState(false);
  const [dialogTableIndex, setDialogTableIndex] = useState(null);

  useEffect(() => {
    if (resources === null) getResources();
  }, []);

  const addTable = () => {
    let i = 1;
    const tableNames = tables.map(t => t.name);
    while (tableNames.includes(`table${i}`)) i += 1;
    dispatch([{ sheetIndex }, { name: 'tables', value: [...tables, { ...blankTable, name: `table${i}` }] }]);
  };

  const handleChange = ({ target }, tableIndex, parent = '') => {
    const { type, checked, name } = target;
    const value = type === 'checkbox' ? checked : target.value;

    if (parent) {
      const parentValue = tables[tableIndex][parent] ?
        { ...tables[tableIndex][parent], [name]: value } :
        { [name]: value };
      dispatch([{ sheetIndex, tableIndex }, { name: parent, value: parentValue }]);
      return;
    }

    dispatch([{ sheetIndex, tableIndex }, { name, value }]);
  };

  const handleMoveTable = (oldIndex, newIndex) => {
    dispatch([{ reorder: 'tables', sheetIndex }, { oldIndex, newIndex }]);
  };

  const handleRemoveTable = tableIndex => {
    tables.splice(tableIndex, 1);
    dispatch([{ sheetIndex }, { name: 'tables', value: [...tables] }]);
  };

  const handleOpenRowBanding = tableIndex => {
    setRowBandingDialogOpen(true);
    setDialogTableIndex(tableIndex);
  };

  const handleOpenTotalsRowDialog = tableIndex => {
    setTotalsRowDialogOpen(true);
    setDialogTableIndex(tableIndex);
  };

  const openFormatDialog = tableIndex => {
    setFormatDialog({
      dialogOpen: true,
      format: tables[tableIndex].nameFormat,
      nav: { sheetIndex, tableIndex },
      name: 'nameFormat',
      sample: tables[tableIndex].name,
    });
  };

  const openFormatColumnsDialog = tableIndex => {
    setFormatDialog({
      dialogOpen: true,
      format: tables[tableIndex].columnNamesFormat,
      nav: { sheetIndex, tableIndex },
      name: 'columnNamesFormat',
      sample: 'Column Title',
    });
  };

  if (resourcesLoading || resources === null) return <Spinner center />;

  return (
    <main>
      <Typography variant="h6">
        Tables
      </Typography>
      <br />
      {tables.map((table, index) => {
        const {
          type, name, dataSourceId, groupingColumn,
        } = table;

        const columnNames = [];
        try {
          if (type === 'Grouping' && dataSourceId) {
            columnNames.push(...dataSources.find(ds => ds.id === dataSourceId).columnNames);
          }
        } finally {
          // do nothing
        }

        return (
          <div key={index}>
            <Row justifyContent="space-between" alignItems="flex-end">
              <ToggleButtonGroup
                color="primary"
                size="small"
                value={type}
                onChange={v => handleChange({ target: { name: 'type', value: v } }, index)}
              >
                <ToggleButton value="Single">Single Table</ToggleButton>
                <ToggleButton value="Grouping">Dynamic Grouping Tables</ToggleButton>
              </ToggleButtonGroup>
              <ButtonGroup color="primary" size="small" className={classes.btnGp}>
                <Button
                  onClick={() => handleMoveTable(index, index - 1)}
                  disabled={index === 0}
                >
                  <ArrowUpward className={classes.iconSmall} />
                </Button>
                <Button
                  onClick={() => handleMoveTable(index, index + 1)}
                  disabled={index === tables.length - 1}
                >
                  <ArrowDownward className={classes.iconSmall} />
                </Button>
                <Button onClick={() => handleRemoveTable(index)}>
                  <Delete className={classes.iconSmall} />
                </Button>
              </ButtonGroup>
            </Row>

            <Row className={classes.marginTop}>
              <FormControl className={classes.select}>
                <InputLabel htmlFor="dataSourceId">Data Source</InputLabel>
                <Select
                  value={dataSourceId}
                  onChange={e => handleChange(e, index)}
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
              {(type === 'Grouping' && dataSourceId) && (
                <FormControl className={classes.gpCol}>
                  <InputLabel htmlFor="groupingColumn">Grouping Column</InputLabel>
                  <Select
                    value={groupingColumn}
                    onChange={e => handleChange(e, index)}
                    inputProps={{ name: 'groupingColumn' }}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {columnNames.map(cn => (
                      <MenuItem key={cn} value={cn}>{cn}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Row>
            {type === 'Single' && (
              <Row className={classes.marginTop}>
                <TextField
                  name="name"
                  label="Table Name"
                  value={name}
                  onChange={e => handleChange(e, index)}
                  fullWidth
                />
                <IconButton
                  color="primary"
                  onClick={() => openFormatDialog(index)}
                >
                  <ColorLens />
                </IconButton>
              </Row>
            )}
            <Row className={classes.marginTop}>
              <TextField
                name="description"
                label="Table Description"
                multiline
                rowsMax="9"
                value={table.description}
                onChange={e => handleChange(e, index)}
                fullWidth
              />
            </Row>
            <Row className={classes.marginTop}>
              <FormControlLabel
                control={(
                  <Checkbox
                    name="printTableName"
                    checked={table.printTableName}
                    color="primary"
                    onChange={e => handleChange(e, index)}
                  />
                  )}
                label="Print Table Name"
              />
              <FormControlLabel
                control={(
                  <Checkbox
                    name="filters"
                    checked={table.filters}
                    color="primary"
                    onChange={e => handleChange(e, index)}
                  />
                  )}
                label="Filter Buttons"
              />
              <FormControlLabel
                control={(
                  <Checkbox
                    name="on"
                    checked={table.totalsRow && table.totalsRow.on}
                    color="primary"
                    onChange={e => handleChange(e, index, 'totalsRow')}
                  />
                  )}
                label="Totals Row"
                style={(!!table.totalsRow && table.totalsRow.on) ? { marginRight: 0 } : {}}
              />
              {(!!table.totalsRow && table.totalsRow.on) && (
                <IconButton
                  color="primary"
                  onClick={e => handleOpenTotalsRowDialog(index, e)}
                >
                  <Functions />
                </IconButton>
              )}
              <FormControlLabel
                control={(
                  <Checkbox
                    name="on"
                    checked={table.rowBanding && table.rowBanding.on}
                    color="primary"
                    onChange={e => handleChange(e, index, 'rowBanding')}
                  />
                  )}
                label="Row Banding"
                style={{ marginRight: 0 }}
              />
              {(!!table.rowBanding && table.rowBanding.on) && (
                <IconButton
                  color="primary"
                  onClick={() => handleOpenRowBanding(index)}
                >
                  <ColorLens />
                </IconButton>
              )}
            </Row>
            <Row className={`${classes.marginTop} ${classes.marginBottom}`}>
              <Button
                color="primary"
                onClick={() => openFormatColumnsDialog(index)}
              >
                <ColorLens className={classes.leftSmallIcon} />
                Format Column Titles
              </Button>
            </Row>
            {/* <br />
            <Button
              color="primary"
              onClick={e => handleOpenTotalsRowDialog(index, e)}
            >
              {(!!table.totalsRow && Object.keys(table.totalsRow).length) ?
                'Edit Totals Row' :
                'Add Totals Row'}
            </Button> */}
            <Divider style={{ margin: '32px 0px' }} />
          </div>
        );
      })}
      <Button color="primary" onClick={addTable}>
        <Add className={classes.leftSmallIcon} />
        New Table
      </Button>

      {(rowBandingDialogOpen && dialogTableIndex !== null) && (
        <RowBandingDialog {...{
          rowBandingDialogOpen,
          setRowBandingDialogOpen,
          rowBanding: tables[dialogTableIndex].rowBanding,
          sheetIndex,
          tableIndex: dialogTableIndex,
        }}
        />
      )}
      {(totalsRowDialogOpen && dialogTableIndex !== null) && (
        <TotalsRowDialog {...{
          totalsRowDialogOpen,
          setTotalsRowDialogOpen,
          totalsRow: tables[dialogTableIndex].totalsRow,
          dataSourceId: tables[dialogTableIndex].dataSourceId,
          sheetIndex,
          tableIndex: dialogTableIndex,
        }}
        />
      )}
    </main>
  );
};

EditTables.propTypes = {
  sheetIndex: PropTypes.number.isRequired,
  tables: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.oneOf(['Single', 'Grouping']),
    description: PropTypes.string,
    printTableName: PropTypes.bool,
    dataSourceId: PropTypes.number,
    rowBanding: PropTypes.shape({
      on: PropTypes.bool,
      colors: PropTypes.shape({
        useDefaults: PropTypes.bool,
        background: PropTypes.arrayOf(PropTypes.string),
        font: PropTypes.arrayOf(PropTypes.string),
      }),
    }),
    totalsRow: PropTypes.shape({
      on: PropTypes.bool,
      columns: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    nameFormat: PropTypes.shape(),
    columnNamesFormat: PropTypes.shape(),
  })),
};

EditTables.defaultProps = {
  tables: [],
};

export default EditTables;
