import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Card,
  CardContent,
  Input,
  Menu,
  Tooltip,
  Typography,
  // TextField,
} from '@material-ui/core';
import {
  FormatBold,
  FormatColorFill,
  FormatColorText,
  FormatItalic,
  FormatStrikethrough,
  FormatUnderlined,
} from '@material-ui/icons';
import { SketchPicker } from 'react-color';
import { Row } from '../../components';

const useStyles = makeStyles(theme => ({
  row: {
    marginBottom: theme.spacing(1),
  },
  sideMargins: {
    margin: theme.spacing(0, 1),
  },
  marginTop: {
    marginTop: theme.spacing(1),
  },
  nowrap: {
    whiteSpace: 'nowrap',
  },
  num: {
    minWidth: 50,
  },
  card: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
}));

const Font = props => {
  const classes = useStyles();
  const {
    useDefaults, font, setFont, fill, setFill,
  } = props;

  const [color, setColor] = useState(font.color);
  const [fgColor, setFgColor] = useState(fill.fgColor);
  const [fontAnchor, setFontAnchor] = useState(null);
  const [fillAnchor, setFillAnchor] = useState(null);

  useEffect(() => {
    setColor(font.color);
    setFgColor(fill.fgColor);
  }, [font, fill]);

  const colors = [
    ...['#FFFFFF', '#000000', '#E7E6E6', '#44546A', '#5B9BD5', '#ED7D31', '#A5A5A5', '#FFC000', '#4472C4', '#70AD47'],
    ...['#F2F2F2', '#808080', '#D0CECE', '#D6DCE4', '#DDEBF7', '#FCE4D6', '#EDEDED', '#FFF2CC', '#D9E1F2', '#E2EFDA'],
    ...['#D9D9D9', '#595959', '#AEAAAA', '#ACB9CA', '#BDD7EE', '#F8CBAD', '#DBDBDB', '#FFE699', '#B4C6E7', '#C6E0B4'],
    ...['#BFBFBF', '#404040', '#757171', '#8497B0', '#9BC2E6', '#F4B084', '#C9C9C9', '#FFD966', '#8EA9DB', '#A9D08E'],
    ...['#A6A6A6', '#262626', '#3A3838', '#333F4F', '#2F75B5', '#C65911', '#7B7B7B', '#BF8F00', '#305496', '#548235'],
    ...['#808080', '#0D0D0D', '#161616', '#222B35', '#1F4E78', '#833C0C', '#525252', '#806000', '#203764', '#375623'],
    ...['#C00000', '#FF0000', '#FFC000', '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0', '#002060', '#7030A0'],
  ];

  return (
    <Card className={classes.card} variant="outlined">
      <CardContent>
        <Typography color="textSecondary">Font</Typography>

        <Row className={classes.row}>
          <Tooltip title="Bold">
            <Button
              color="primary"
              onClick={() => setFont({ ...font, bold: !font.bold })}
              variant={font.bold ? 'contained' : 'outlined'}
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <FormatBold />
            </Button>
          </Tooltip>

          <Tooltip title="Italics">
            <Button
              color="primary"
              onClick={() => setFont({ ...font, italics: !font.italics })}
              variant={font.italics ? 'contained' : 'outlined'}
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <FormatItalic />
            </Button>
          </Tooltip>

          <Tooltip title="Underline">
            <Button
              color="primary"
              onClick={() => setFont({ ...font, underline: !font.underline })}
              variant={font.underline ? 'contained' : 'outlined'}
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <FormatUnderlined />
            </Button>
          </Tooltip>

          <Tooltip title="Strikethrough">
            <Button
              color="primary"
              onClick={() => setFont({ ...font, strike: !font.strike })}
              variant={font.strike ? 'contained' : 'outlined'}
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <FormatStrikethrough />
            </Button>
          </Tooltip>
        </Row>

        <Row className={classes.row} alignItems="center">
          <Typography variant="button" className={`${classes.sideMargins} ${classes.nowrap}`}>Font Size</Typography>
          <Input
            value={font.size}
            margin="dense"
            className={`${classes.sideMargins} ${classes.num}`}
            onChange={({ target: { value } }) => setFont({ ...font, size: value === '' ? '' : Number(value) })}
            inputProps={{
              step: 2,
              min: 1,
              max: 409,
              type: 'number',
            }}
            disabled={useDefaults}
          />
        </Row>

        <Row className={classes.row}>
          <Tooltip title="Font Color">
            <Button
              color="primary"
              onClick={e => setFontAnchor(e.currentTarget)}
              variant="outlined"
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <FormatColorText />
            </Button>
          </Tooltip>
          <Menu
            anchorEl={fontAnchor}
            keepMounted
            open={!!fontAnchor}
            onClose={() => setFontAnchor(null)}
          >
            <SketchPicker
              color={color}
              onChange={setColor}
              onChangeComplete={setColor}
              disableAlpha
              presetColors={colors}
              width={250}
            />
            <Row justifyContent="flex-end" className={classes.marginTop}>
              <Button onClick={() => setFontAnchor(null)} color="primary">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setFontAnchor(null);
                  setFont({ ...font, color: color.hex });
                }}
                color="primary"
              >
                Save
              </Button>
            </Row>
          </Menu>

          <Tooltip title="Fill Color">
            <Button
              color="primary"
              onClick={e => setFillAnchor(e.currentTarget)}
              variant="outlined"
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <FormatColorFill />
            </Button>
          </Tooltip>
          <Menu
            anchorEl={fillAnchor}
            keepMounted
            open={!!fillAnchor}
            onClose={() => setFillAnchor(null)}
          >
            <SketchPicker
              color={fgColor}
              onChange={setFgColor}
              onChangeComplete={setFgColor}
              disableAlpha
              presetColors={colors}
              width={250}
            />
            <Row justifyContent="flex-end" className={classes.marginTop}>
              <Button onClick={() => setFillAnchor(null)} color="primary">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setFillAnchor(null);
                  setFill({ ...fill, fgColor: fgColor.hex });
                }}
                color="primary"
              >
                Save
              </Button>
            </Row>
          </Menu>
        </Row>
      </CardContent>
    </Card>
  );
};

Font.propTypes = {
  useDefaults: PropTypes.bool.isRequired,
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
  }).isRequired,
  setFont: PropTypes.func.isRequired,
  fill: PropTypes.shape({
    fgColor: PropTypes.string,
  }).isRequired,
  setFill: PropTypes.func.isRequired,
};

export default Font;
