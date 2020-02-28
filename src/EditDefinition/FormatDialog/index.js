import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  // DialogContentText,
  DialogTitle,
  Typography,
  // TextField,
} from '@material-ui/core';
import Font from './Font';
import Border from './Border';
import Alignment from './Alignment';
import NumberFormat from './NumberFormat';
import { Row } from '../../components';
import { useInput } from '../../hooks';
import { DefDispatch, FormatContext } from '../Context';

const calculateBorder = border => {
  if (!border) return 'none';
  const { style, color } = border;
  let st = 'solid';
  let width = '1px';

  // width
  if (style === 'none') return style;
  if (style.startsWith('medium')) width = '2px';
  if (style === 'thick') width = '3px';

  // style
  if (style.toLowerCase().includes('dash')) st = 'dashed';
  if (style === 'dotted') st = 'dotted';
  if (style === 'double') st = 'double';

  return `${width} ${st} ${color}`;
};

const useStyles = makeStyles(theme => ({
  box: {
    borderLeft: ({ left }) => calculateBorder(left),
    borderRight: ({ right }) => calculateBorder(right),
    borderTop: ({ top }) => calculateBorder(top),
    borderBottom: ({ bottom }) => calculateBorder(bottom),
    margin: theme.spacing(1),
    padding: theme.spacing(0),
    textAlign: ({ alignHoriz }) => alignHoriz,
    paddingLeft: ({ indent }) => theme.spacing(indent),
    whiteSpace: ({ wrap }) => (wrap ? 'normal' : 'nowrap'),
    fontStyle: ({ italics }) => (italics ? 'italic' : 'normal'),
    backgroundColor: ({ fgColor }) => fgColor,
  },
  text: {
    transform: ({ rotate }) => `rotateZ(${-rotate}deg)`,
    transformOrigin: '0% 0%',
    fontWeight: ({ bold }) => (bold ? 900 : 'normal'),
    fontSize: ({ size }) => size,
    color: ({ color }) => color,
    textDecoration: ({ underline, strike }) => {
      if (!underline && !strike) return 'none';
      return `${underline ? 'underline' : ''} ${strike ? 'line-through' : ''}`;
    },
    textDecorationColor: ({ color }) => color,
  },
  row: {
    marginBottom: theme.spacing(1),
  },
  sideMargins: {
    margin: theme.spacing(0, 1),
  },
  nowrap: {
    whiteSpace: 'nowrap',
  },
  slider: {
    minWidth: 100,
    margin: theme.spacing(0, 2, 1, 2),
  },
  num: {
    minWidth: 50,
  },
  card: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  borderStyle: {
    minWidth: 142,
  },
}));

const alignmentDefaults = {
  horizontal: 'left',
  indent: 0, // Number of spaces to indent = indent value * 3
  shrinkToFit: false,
  textRotation: 0, // number of degrees to rotate text counter-clockwise
  vertical: 'bottom',
  wrapText: false,
};

const fontDefaults = {
  bold: false,
  color: '#000000',
  italics: false,
  shadow: true,
  strike: false,
  size: 11,
  underline: false,
};

const borderDefaults = {
  left: {
    style: 'none',
    color: '#000000',
  },
  right: {
    style: 'none',
    color: '#000000',
  },
  top: {
    style: 'none',
    color: '#000000',
  },
  bottom: {
    style: 'none',
    color: '#000000',
  },
};

const fillDefaults = {
  type: 'pattern',
  patternType: 'solid', // §18.18.55 ST_PatternType (Pattern Type)
  // bgColor: string, // HTML style hex value. defaults to black
  fgColor: '#FFFFFF', // HTML style hex value. defaults to black.
};

const numberFormatDefault = '';

const FormatDialog = props => {
  const {
    dialogOpen,
    // setDialogOpen,
    format,
    nav,
    name,
    sample,
    onSave,
  } = props;
  const dispatch = useContext(DefDispatch);
  const { setFormatDialog } = useContext(FormatContext);

  const [useDefaults, changeUseDefaults, setUseDefaults] = useInput(true);
  const [alignment, setAlignment] = useState({ ...alignmentDefaults });
  const [font, setFont] = useState({ ...fontDefaults });
  const [border, setBorder] = useState({ ...borderDefaults });
  const [fill, setFill] = useState({ ...fillDefaults });
  const [numberFormat, changeNumberFormat, setNumberFormat] = useInput(numberFormatDefault);

  const classes = useStyles({
    alignHoriz: alignment.horizontal,
    indent: alignment.indent,
    rotate: alignment.textRotation,
    wrap: alignment.wrapText,
    ...font,
    ...border,
    ...fill,
  });


  useEffect(() => {
    setUseDefaults(format.useDefaults === undefined ? true : format.useDefaults);
    setAlignment({ ...(format.alignment ? format.alignment : alignmentDefaults) });
    setFont({ ...(format.font ? format.font : fontDefaults) });
    setBorder({ ...(format.border ? format.border : borderDefaults) });
    setFill({ ...(format.fill ? format.fill : fillDefaults) });
    setNumberFormat(format.numberFormat || numberFormatDefault);
    // if (format.alignment) setAlignment(...format.alignment);
    // if (format.font) setFont(...format.font);
    // if (format.border) setBorder(...format.border);
    // if (format.fill) setFill(...format.fill);
    // if (format.numberFormat) setNumberFormat(format.numberFormat);
  }, [format, dialogOpen]);

  // const formatColor = color => {
  //   let value = color;

  //   while (value.includes('##')) value = value.replace('##', '#');
  //   value = value.charAt(0) !== '#' ? `#${value}` : value;
  //   value = value.toUpperCase();

  //   return value;
  // };

  const closeDialog = () => setFormatDialog({ dialogOpen: false });

  const handleSave = () => {
    const value = {
      useDefaults,
      font,
      border,
      alignment: {
        ...alignment,
        indent: alignment.indent === 0 ? undefined : alignment.indent,
      },
      fill: (fill.fgColor && fill.fgColor !== '#FFFFFF') ? fill : undefined,
      numberFormat: numberFormat || undefined,
    };

    if (onSave !== null) { console.log('onSave'); onSave(value); }
    if (onSave === null) dispatch([nav, { name, value }]);
    closeDialog();
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={closeDialog}
    >
      <DialogTitle>
        <Typography color="textSecondary">Preview</Typography>
        <div className={classes.box}>
          <Typography className={classes.text}>{sample}</Typography>
        </div>
      </DialogTitle>
      <DialogContent>
        <Row className={classes.row}>
          <FormControlLabel
            control={(
              <Checkbox
                name="useDefaults"
                checked={useDefaults}
                color="primary"
                onChange={changeUseDefaults}
              />
            )}
            label="Use Theme Defaults"
            className={classes.sideMargins}
          />
        </Row>

        <Font {...{
          useDefaults, font, setFont, fill, setFill,
        }}
        />

        <Border {...{ useDefaults, border, setBorder }} />

        <Alignment {...{ useDefaults, alignment, setAlignment }} />

        <NumberFormat {...{ useDefaults, numberFormat, changeNumberFormat }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FormatDialog.propTypes = {
  dialogOpen: PropTypes.bool,
  // setDialogOpen: PropTypes.func.isRequired,
  format: PropTypes.shape({
    useDefaults: PropTypes.bool,
    alignment: PropTypes.shape({
      horizontal: PropTypes.oneOf(['center', 'centerContinuous', 'distributed', 'fill', 'general', 'justify', 'left', 'right']),
      indent: PropTypes.number, // Number of spaces to indent = indent value * 3
      // justifyLastLine: false,
      // readingOrder: ['contextDependent', 'leftToRight', 'rightToLeft'],
      // relativeIndent: integer, // number of additional spaces to indent
      shrinkToFit: PropTypes.bool,
      textRotation: PropTypes.number, // number of degrees to rotate text counter-clockwise
      vertical: PropTypes.oneOf(['bottom', 'center', 'distributed', 'justify', 'top']),
      wrapText: PropTypes.bool,
    }),
    font: PropTypes.exact({
      bold: PropTypes.bool,
      // charset: integer,
      color: PropTypes.string,
      // condense: boolean,
      // extend: boolean,
      // family: string,
      italics: PropTypes.bool,
      // name: string,
      // outline: boolean,
      // scheme: string, // §18.18.33 ST_FontScheme (Font scheme Styles)
      shadow: PropTypes.bool,
      strike: PropTypes.bool,
      size: PropTypes.number,
      underline: PropTypes.bool,
    }),
    fill: PropTypes.shape({
      fgColor: PropTypes.string,
    }),
    border: PropTypes.exact({
      left: PropTypes.exact({
        style: PropTypes.string,
        color: PropTypes.string, // HTML style hex value
      }),
      right: PropTypes.exact({
        style: PropTypes.string,
        color: PropTypes.string,
      }),
      top: PropTypes.exact({
        style: PropTypes.string,
        color: PropTypes.string,
      }),
      bottom: PropTypes.exact({
        style: PropTypes.string,
        color: PropTypes.string,
      }),
      // diagonal: {
      //   style: PropTypes.string,
      //   color: PropTypes.string,
      // },
      // diagonalDown: true,
      // diagonalUp: true,
      // outline: true,
    }),
    numberFormat: PropTypes.string,
  }),
  nav: PropTypes.shape({
    sheetIndex: PropTypes.number,
    tableIndex: PropTypes.number,
  }),
  name: PropTypes.string,
  sample: PropTypes.string,
  onSave: PropTypes.func,
};

FormatDialog.defaultProps = {
  dialogOpen: false,
  format: {},
  sample: 'Sample',
  nav: {},
  name: 'nameFormat',
  onSave: null,
};

export default FormatDialog;
