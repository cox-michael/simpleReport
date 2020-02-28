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
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
} from '@material-ui/core';
import { useInput } from '../hooks';
import { DefDispatch } from './Context';

const useStyles = makeStyles(theme => ({
  formControl: {
    marginTop: theme.spacing(1) * 2,
    minWidth: 120,
  },
}));

const RowBandingDialog = props => {
  const classes = useStyles();
  const {
    rowBandingDialogOpen,
    setRowBandingDialogOpen,
    rowBanding,
    sheetIndex,
    tableIndex,
    table,
  } = props;
  const dispatch = useContext(DefDispatch);


  const [useDefaults, changeUseDefaults, setUseDefaults] = useInput(true);
  // const [useDefaults, setUseDefaults] = useState(true);
  const [primaryBackground, setPrimaryBackground] = useState('#333333');
  const [secondaryBackground, setSecondaryBackground] = useState('#FFFFFF');
  const [primaryFont, setPrimaryFont] = useState('#FFFFFF');
  const [secondaryFont, setSecondaryFont] = useState('#333333');

  useEffect(() => {
    const { primary, secondary, useDefaults: useDefaultsProp } = rowBanding;

    setUseDefaults(useDefaultsProp === undefined ? true : useDefaultsProp);
    setPrimaryFont((primary && primary.font) ? primary.font : '#FFFFFF');
    setPrimaryBackground((primary && primary.background) ? primary.background : '#333333');
    setSecondaryFont((secondary && secondary.font) ? secondary.font : '#333333');
    setSecondaryBackground((secondary && secondary.background) ? secondary.background : '#FFFFFF');
  }, [rowBanding]);

  const formatColor = color => {
    let value = color;

    while (value.includes('##')) value = value.replace('##', '#');
    value = value.charAt(0) !== '#' ? `#${value}` : value;
    value = value.toUpperCase();

    return value;
  };

  const handleSave = () => {
    const value = {
      on: true,
      useDefaults,
      primary: {
        font: primaryFont,
        background: primaryBackground,
      },
      secondary: {
        font: secondaryFont,
        background: secondaryBackground,
      },
    };

    if (tableIndex === null && table !== null) {
      console.log('calling dispatch');
      dispatch([{ sheetIndex }, { name: 'table', value: { ...table, rowBanding: value } }]);
      setRowBandingDialogOpen(false);
      return;
    }

    dispatch([{ sheetIndex, tableIndex }, { name: 'rowBanding', value }]);
    setRowBandingDialogOpen(false);
  };

  return (
    <Dialog
      open={rowBandingDialogOpen}
      onClose={() => setRowBandingDialogOpen(false)}
    >
      <DialogTitle>Table Row Banding</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You can specify the hex color values you wish to use or you can use the defaults set by
          {' '}
          the site administrator.
          <br />
          Please test your colors in Excel as the colors are not rendered the same as they are on
          {' '}
          the web.
        </DialogContentText>
        <FormControlLabel
          control={(
            <Checkbox
              name="useDefaults"
              checked={useDefaults}
              color="primary"
              onChange={changeUseDefaults}
            />
          )}
          label="Use Default Colors"
        />
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Background Color</TableCell>
              <TableCell>Font Color</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell
                component="th"
                scope="row"
                style={{
                  backgroundColor: primaryBackground,
                  color: primaryFont,
                }}
              >
                Primary Band
              </TableCell>
              <TableCell>
                <TextField
                  name="primaryBackground"
                  value={primaryBackground}
                  disabled={useDefaults}
                  onChange={e => setPrimaryBackground(formatColor(e.target.value))}
                />
              </TableCell>
              <TableCell>
                <TextField
                  name="primaryFont"
                  value={primaryFont}
                  disabled={useDefaults}
                  onChange={e => setPrimaryFont(formatColor(e.target.value))}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                component="th"
                scope="row"
                style={{
                  backgroundColor: secondaryBackground,
                  color: secondaryFont,
                }}
              >
                Secondary Band
              </TableCell>
              <TableCell>
                <TextField
                  name="secondaryBackground"
                  value={secondaryBackground}
                  disabled={useDefaults}
                  onChange={e => setSecondaryBackground(formatColor(e.target.value))}
                />
              </TableCell>
              <TableCell>
                <TextField
                  name="secondaryFont"
                  value={secondaryFont}
                  disabled={useDefaults}
                  onChange={e => setSecondaryFont(formatColor(e.target.value))}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setRowBandingDialogOpen(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

RowBandingDialog.propTypes = {
  rowBandingDialogOpen: PropTypes.bool.isRequired,
  setRowBandingDialogOpen: PropTypes.func.isRequired,
  rowBanding: PropTypes.shape({
    on: PropTypes.bool,
    useDefaults: PropTypes.bool,
    primary: PropTypes.shape({
      font: PropTypes.string,
      background: PropTypes.string,
    }),
    secondary: PropTypes.shape({
      font: PropTypes.string,
      background: PropTypes.string,
    }),
  }),
  sheetIndex: PropTypes.number.isRequired,
  tableIndex: PropTypes.number,
  table: PropTypes.shape(),
};

RowBandingDialog.defaultProps = {
  rowBanding: {},
  tableIndex: null,
  table: null,
};

export default RowBandingDialog;
