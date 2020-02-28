/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
} from '@material-ui/core';
// import { Add } from '@material-ui/icons';
import { Row } from '../components';
import { DefDispatch, DefContext } from './Context';

const useStyles = makeStyles(theme => ({
  // leftSmallIcon: {
  //   marginRight: theme.spacing(1),
  //   fontSize: 20,
  // },
  formControl: {
    minWidth: 250,
    marginLeft: theme.spacing(1),
  },
  marginTop: {
    marginTop: theme.spacing(1),
  },
}));

// const defaultColumns = [{
//   letter: 'A',
//   value: '',
//   str: '',
// }];

const TotalsRowDialog = props => {
  const classes = useStyles();
  const {
    totalsRowDialogOpen,
    setTotalsRowDialogOpen,
    totalsRow: { columns: columnsProp },
    dataSourceId,
    sheetIndex,
    tableIndex,
    table,
  } = props;

  const dispatch = useContext(DefDispatch);
  let { dataSources } = useContext(DefContext);
  if (!dataSources) dataSources = [];

  const columnNames = [];
  if (dataSourceId) columnNames.push(...dataSources.find(ds => ds.id === dataSourceId).columnNames);

  const [columns, setColumns] = useState({});

  useEffect(() => {
    // define cols
    let cols = {};
    if (columnsProp) cols = columnsProp;

    // add missing columnNames
    columnNames.forEach(cn => {
      if (!cols[cn]) cols[cn] = 0;
    });

    // remove extra columnNames
    Object.keys(cols).forEach(k => {
      if (!columnNames.includes(k)) delete cols[k];
    });

    setColumns(cols);

    // if (!columns) {
    //   const value = { on: true, columns: {} };
    //   dispatch([{ sheetIndex, tableIndex }, { name: 'totalsRow', value }]);
    // }
    // if (!totalsRow) { console.log('setting columns to []'); setColumns([]); return; }
    // console.log({ totalsRow });

    // const colArr = [];
    // Object.entries(totalsRow).forEach(([key, value]) => {
    //   console.log({ key, value });
    //   if (typeof value === 'number') {
    //     colArr.push({ letter: key, value, str: '' });
    //   } else {
    //     colArr.push({ letter: key, value: 0, str: value });
    //   }
    // });

    // console.log({ colArr });
    // setColumns(colArr);
  }, [columnsProp]);

  const handleChange = ({ target }) => {
    const { type, checked, name } = target;
    const value = type === 'checkbox' ? checked : target.value;
    setColumns({ ...columns, [name]: value });
  };

  const handleSave = () => {
    // const value = {};
    // columns.forEach(column => {
    //   console.log({ column });
    //   if (column.value === 0) {
    //     value[column.letter] = column.str;
    //   } else {
    //     value[column.letter] = column.value;
    //   }
    // });
    // dispatch(['updateTable', {
    //   sheetIndex,
    //   tableIndex,
    //   name: 'totalsRow',
    //   value,
    // }]);

    const value = { on: true, columns };

    if (tableIndex === null && table !== null) {
      console.log('calling dispatch');
      dispatch([{ sheetIndex }, { name: 'table', value: { ...table, totalsRow: value } }]);
      setTotalsRowDialogOpen(false);
      return;
    }

    dispatch([{ sheetIndex, tableIndex }, { name: 'totalsRow', value }]);
    setTotalsRowDialogOpen(false);
  };

  console.log({ columns, types: Object.values(columns).map(c => typeof c) });

  return (
    <Dialog
      open={totalsRowDialogOpen}
      onClose={() => setTotalsRowDialogOpen(false)}
      maxWidth="lg"
    >
      <DialogTitle>Table Totals Row</DialogTitle>
      <DialogContent>
        {columnNames.map(cn => (
          <Row key={cn} justifyContent="space-between" alignItems="flex-end">
            <Typography variant="button">
              {cn}
            </Typography>
            <Row justifyContent="flex-end" alignItems="flex-end">
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="value">Function</InputLabel>
                <Select
                  value={columns[cn]}
                  onChange={handleChange}
                  inputProps={{ name: cn }}
                >
                  <MenuItem value={0}><em>None</em></MenuItem>

                  <MenuItem value={typeof columns[cn] === 'string' ? columns[cn] : ''}>String (not a function)</MenuItem>

                  <MenuItem value={1}>AVERAGE (exclude hidden)</MenuItem>
                  <MenuItem value={2}>COUNT (exclude hidden)</MenuItem>
                  <MenuItem value={3}>COUNTA (exclude hidden)</MenuItem>
                  <MenuItem value={4}>MAX (exclude hidden)</MenuItem>
                  <MenuItem value={5}>MIN (exclude hidden)</MenuItem>
                  <MenuItem value={6}>PRODUCT (exclude hidden)</MenuItem>
                  <MenuItem value={7}>STDEV.S (exclude hidden)</MenuItem>
                  <MenuItem value={8}>STDEV.P (exclude hidden)</MenuItem>
                  <MenuItem value={9}>SUM (exclude hidden)</MenuItem>
                  <MenuItem value={10}>VAR.S (exclude hidden)</MenuItem>
                  <MenuItem value={11}>VAR.P (exclude hidden)</MenuItem>

                  <MenuItem value={101}>AVERAGE (include hidden)</MenuItem>
                  <MenuItem value={102}>COUNT (include hidden)</MenuItem>
                  <MenuItem value={103}>COUNTA (include hidden)</MenuItem>
                  <MenuItem value={104}>MAX (include hidden)</MenuItem>
                  <MenuItem value={105}>MIN (include hidden)</MenuItem>
                  <MenuItem value={106}>PRODUCT (include hidden)</MenuItem>
                  <MenuItem value={107}>STDEV.S (include hidden)</MenuItem>
                  <MenuItem value={108}>STDEV.P (include hidden)</MenuItem>
                  <MenuItem value={109}>SUM (include hidden)</MenuItem>
                  <MenuItem value={110}>VAR.S (include hidden)</MenuItem>
                  <MenuItem value={111}>VAR.P (include hidden)</MenuItem>
                </Select>
              </FormControl>
              {(typeof columns[cn] === 'string') && (
                <TextField
                  name={cn}
                  className={classes.formControl}
                  label="String"
                  value={columns[cn]}
                  onChange={handleChange}
                />
              )}
            </Row>
          </Row>
        )) }
        {/* <Button color="primary" onClick={handleAddColumn}>
          <Add className={classes.leftSmallIcon} />
          Add Calculation
        </Button> */}
        <DialogContentText className={classes.marginTop}>
          Learn more about the
          {' '}
          <a
            href="https://exceljet.net/excel-functions/excel-subtotal-function"
            target="_blank"
            rel="noopener noreferrer"
          >
            Excel SUBTOTAL Function
          </a>
          .
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setTotalsRowDialogOpen(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TotalsRowDialog.propTypes = {
  totalsRowDialogOpen: PropTypes.bool.isRequired,
  setTotalsRowDialogOpen: PropTypes.func.isRequired,
  totalsRow: PropTypes.shape({
    on: PropTypes.bool,
    columns: PropTypes.objectOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ),
  }),
  dataSourceId: PropTypes.number,
  sheetIndex: PropTypes.number.isRequired,
  tableIndex: PropTypes.number,
  table: PropTypes.shape(),
};

TotalsRowDialog.defaultProps = {
  totalsRow: null,
  dataSourceId: null,
  tableIndex: null,
  table: null,
};

export default TotalsRowDialog;
