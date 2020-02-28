import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  ColorLens,
  Delete,
  ArrowBack,
  ArrowForward,
  Functions,
} from '@material-ui/icons';
import EditTables from './EditTables';
import RowBandingDialog from '../RowBandingDialog';
import TotalsRowDialog from '../TotalsRowDialog';
import {
  Row,
  ToggleButton,
  ToggleButtonGroup,
  Spinner,
} from '../../components';
import { SessionContext } from '../../Session';
import { DefDispatch, DefContext, FormatContext } from '../Context';

const useStyles = makeStyles(theme => ({
  iconSmall: {
    fontSize: 20,
  },
  marginTop: {
    marginTop: theme.spacing(1),
  },
  select: {
    minWidth: 200,
  },
  gpCol: {
    minWidth: 200,
    marginLeft: theme.spacing(1),
  },
  leftSmallIcon: {
    marginRight: theme.spacing(1),
    fontSize: 20,
  },
}));

const TabContainer = ({ children }) => (
  <Typography component="div" style={{ padding: 8 * 3 }}>
    {children}
  </Typography>
);

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const blankSheet = {
  // tables: PropTypes.array,
  name: 'sheet1',
  type: 'Single',
  printSheetName: true,
  printReportName: true,
  description: '',
};

const EditSheets = props => {
  const classes = useStyles();
  const { sheets } = props;
  const dispatch = useContext(DefDispatch);
  let { dataSources } = useContext(DefContext);
  const { resources } = useContext(SessionContext);
  const { setFormatDialog } = useContext(FormatContext);
  if (!dataSources) dataSources = [];

  const [tab, setTab] = useState(0);
  const [rowBandingDialogOpen, setRowBandingDialogOpen] = useState(false);
  const [totalsRowDialogOpen, setTotalsRowDialogOpen] = useState(false);

  useEffect(() => {
    if (!sheets.length) dispatch([{}, { name: 'sheets', value: [blankSheet] }]);
  }, [sheets]);

  const { table } = sheets[tab];

  console.log({ table });

  const handleChange = ({ target }) => {
    const { name, type, checked } = target;
    const value = type === 'checkbox' ? checked : target.value;
    dispatch([{ sheetIndex: tab }, { name, value }]);
  };

  const handleTableChange = ({ target }, parent = '') => {
    const { name, type, checked } = target;
    console.log({
      target, name, type, checked, parent,
    });
    const value = type === 'checkbox' ? checked : target.value;

    if (parent) {
      const parentValue = table[parent] ? { ...table[parent], [name]: value } : { [name]: value };
      dispatch([
        { sheetIndex: tab },
        { name: 'table', value: { ...table, [parent]: parentValue } },
      ]);
      return;
    }

    dispatch([{ sheetIndex: tab }, { name: 'table', value: { ...table, [name]: value } }]);
  };

  const handleTabChange = (e, value) => {
    setTab(value);

    if (value === sheets.length) {
      let i = 1;
      const sheetNames = sheets.map(s => s.name);
      while (sheetNames.includes(`sheet${i}`)) i += 1;
      dispatch([{}, { name: 'sheets', value: [...sheets, { ...blankSheet, name: `sheet${i}` }] }]);
    }
  };

  const removeSheet = () => {
    if (tab === (sheets.length - 1) && tab !== 0) setTab(tab - 1);
    sheets.splice(tab, 1);
    const updatedSheets = sheets.length ? [...sheets] : [blankSheet];
    dispatch([{}, { name: 'sheets', value: updatedSheets }]);
  };

  const moveSheet = (direction, index) => {
    const move = direction === 'left' ? -1 : 1;
    setTab(index + move);
    dispatch([{ reorder: 'sheets' }, { oldIndex: index, newIndex: index + move }]);
  };

  if (!sheets.length || !sheets[tab]) return <Spinner center />;

  const columnNames = [];
  try {
    if (sheets[tab].type === 'Grouping' && sheets[tab].dataSourceId) {
      columnNames.push(...dataSources.find(ds => ds.id === sheets[tab].dataSourceId).columnNames);
    }
  } finally {
    // do nothing
  }

  const openFormatDialog = () => {
    setFormatDialog({
      dialogOpen: true,
      format: sheets[tab].nameFormat,
      nav: { sheetIndex: tab },
      name: 'nameFormat',
      sample: sheets[tab].name,
    });
  };

  const openFormatColumnsDialog = () => {
    setFormatDialog({
      dialogOpen: true,
      format: table.columnNamesFormat,
      sample: 'Column Title',
      onSave: format => {
        dispatch([
          { sheetIndex: tab },
          { name: 'table', value: { ...table, columnNamesFormat: format } },
        ]);
      },
    });
  };

  return (
    <main>
      <Typography component="h1" variant="h5" align="center">
        Sheets
      </Typography>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {[...sheets, { name: '+' }].map(sheet => (
          <Tab
            label={sheet.name}
            key={sheet.name}
            style={{ textTransform: 'none' }}
          />
        ))}
      </Tabs>
      <TabContainer>
        <Row justifyContent="center">
          <ButtonGroup color="primary" size="small">
            <Button
              onClick={() => moveSheet('left', tab)}
              disabled={tab === 0}
            >
              <ArrowBack className={classes.iconSmall} />
            </Button>
            <Button
              onClick={removeSheet}
            >
              <Delete className={classes.iconSmall} />
            </Button>
            <Button
              onClick={() => moveSheet('right', tab)}
              disabled={tab === sheets.length - 1}
            >
              <ArrowForward className={classes.iconSmall} />
            </Button>
          </ButtonGroup>
        </Row>
        <Row justifyContent="center" className={classes.marginTop}>
          <ToggleButtonGroup
            color="primary"
            size="small"
            value={sheets[tab].type}
            onChange={v => handleChange({ target: { name: 'type', value: v } })}
          >
            <ToggleButton value="Single">Single Sheet</ToggleButton>
            <ToggleButton value="Grouping">Dynamic Grouping Sheets</ToggleButton>
          </ToggleButtonGroup>
        </Row>

        <Row alignItems="flex-end" className={classes.marginTop}>
          {sheets[tab].type === 'Single' && (
            <>
              <TextField
                name="name"
                label="Sheet Name"
                value={sheets[tab].name}
                onChange={handleChange}
                fullWidth
              />
              <IconButton
                color="primary"
                onClick={openFormatDialog}
              >
                <ColorLens />
              </IconButton>
            </>
          )}
          {sheets[tab].type === 'Grouping' && (
            <FormControl className={classes.select}>
              <InputLabel htmlFor="dataSourceId">Data Source</InputLabel>
              <Select
                value={sheets[tab].dataSourceId}
                onChange={handleChange}
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
          {sheets[tab].dataSourceId && (
            <FormControl className={classes.gpCol}>
              <InputLabel htmlFor="groupingColumn">Grouping Column</InputLabel>
              <Select
                value={sheets[tab].groupingColumn}
                onChange={handleChange}
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

        <Row className={classes.marginTop}>
          <TextField
            name="description"
            label="Sheet Description"
            multiline
            rowsMax="9"
            value={sheets[tab].description}
            onChange={handleChange}
            fullWidth
          />
        </Row>

        <Row className={classes.marginTop}>
          <FormControlLabel
            control={(
              <Checkbox
                name="printReportName"
                checked={sheets[tab].printReportName}
                color="primary"
                onChange={handleChange}
              />
                    )}
            label="Print Report Name"
          />
          <FormControlLabel
            control={(
              <Checkbox
                name="printSheetName"
                checked={sheets[tab].printSheetName}
                color="primary"
                onChange={handleChange}
              />
                  )}
            label="Print Sheet Name"
          />
        </Row>

        {sheets[tab].type === 'Grouping' && (
          <>
            <Row>
              <FormControlLabel
                control={(
                  <Checkbox
                    name="printTableName"
                    checked={table.printTableName}
                    color="primary"
                    onChange={e => handleTableChange(e)} // Checkbox onChange passes two arguments
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
                    onChange={e => handleTableChange(e)} // Checkbox onChange passes two arguments
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
                    onChange={e => handleTableChange(e, 'totalsRow')}
                  />
                  )}
                label="Totals Row"
                style={(!!table.totalsRow && table.totalsRow.on) ? { marginRight: 0 } : {}}
              />
              {(!!table.totalsRow && table.totalsRow.on) && (
                <IconButton
                  color="primary"
                  onClick={() => setTotalsRowDialogOpen(true)}
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
                    onChange={e => handleTableChange(e, 'rowBanding')}
                  />
                  )}
                label="Row Banding"
                style={{ marginRight: 0 }}
              />
              {(!!table.rowBanding && table.rowBanding.on) && (
                <IconButton
                  color="primary"
                  onClick={() => setRowBandingDialogOpen(true)}
                >
                  <ColorLens />
                </IconButton>
              )}
            </Row>

            <Row className={`${classes.marginTop} ${classes.marginBottom}`}>
              <Button
                color="primary"
                onClick={openFormatColumnsDialog}
              >
                <ColorLens className={classes.leftSmallIcon} />
                Format Column Titles
              </Button>
            </Row>
          </>
        )}

        {sheets[tab].type === 'Single' && (
          <div style={{ marginTop: 16 }}>
            <EditTables {...{ sheetIndex: tab, tables: sheets[tab].tables, dispatch }} />
          </div>
        )}
      </TabContainer>

      {rowBandingDialogOpen && (
        <RowBandingDialog {...{
          rowBandingDialogOpen,
          setRowBandingDialogOpen,
          rowBanding: table.rowBanding,
          sheetIndex: tab,
          table,
        }}
        />
      )}
      {totalsRowDialogOpen && (
        <TotalsRowDialog {...{
          totalsRowDialogOpen,
          setTotalsRowDialogOpen,
          totalsRow: table.totalsRow,
          dataSourceId: sheets[tab].dataSourceId,
          sheetIndex: tab,
          table,
        }}
        />
      )}
    </main>
  );
};

const calcError = (propName, componentName, prop, shouldBe) => {
  let msg = `Invalid prop \`${propName}\` `;
  msg += `of type ${typeof prop} `;
  msg += `supplied to \`${componentName}\`. `;
  msg += `Should be \`${shouldBe}\`. Validation failed.`;
  return new Error(msg);
};

EditSheets.propTypes = {
  sheets: PropTypes.arrayOf(PropTypes.shape({
    tables: PropTypes.array,
    name: PropTypes.string,
    type: PropTypes.oneOf(['Single', 'Grouping']),
    // eslint-disable-next-line consistent-return
    dataSourceId: (props, propName, componentName) => {
      if (
        props.type === 'Grouping' &&
        (props[propName] === undefined || typeof props[propName] !== 'number')
      ) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`,
        );
      }
    },
    // eslint-disable-next-line consistent-return
    groupingColumn: (props, propName, componentName) => {
      if (
        props.type === 'Grouping' &&
        (props[propName] === undefined || typeof props[propName] !== 'string')
      ) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`,
        );
      }
    },
    printSheetName: PropTypes.bool,
    printReportName: PropTypes.bool,
    description: PropTypes.string,
    nameFormat: PropTypes.shape(),
    table: (props, propName, componentName) => {
      if (props.type === 'Grouping' && props[propName] === undefined) {
        props[propName] = {};
        return;
      }
      if (props.type === 'Grouping' && typeof props[propName] !== 'object') {
        // eslint-disable-next-line consistent-return
        return calcError(propName, componentName, props[propName], 'object');
      }
    },
  })),
};

EditSheets.defaultProps = {
  sheets: [],
};

export default EditSheets;
