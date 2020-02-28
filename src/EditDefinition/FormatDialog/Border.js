import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@material-ui/core';
import {
  BorderLeft,
  BorderRight,
  BorderBottom,
  BorderTop,
  // BorderAll,
  BorderOuter,
  // BorderInner,
  BorderClear,
  BorderColor,
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
  card: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  borderStyle: {
    minWidth: 142,
  },
  marginTop: {
    marginTop: theme.spacing(1),
  },
}));

const Border = props => {
  const classes = useStyles();
  const { useDefaults, border, setBorder } = props;

  const [borderStyle, setBorderStyle] = useState('medium');
  const [color, setColor] = useState('#000000');
  const [tmpColor, setTmpColor] = useState('#000000');
  const [anchor, setAnchor] = useState(null);

  useEffect(() => {
    setTmpColor(color);
  }, [anchor]);

  const borderStyles = ['none', 'thin', 'medium', 'dashed', 'dotted', 'thick', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'mediumDashDotDot', 'slantDashDot'];
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
        <Typography color="textSecondary">Border</Typography>

        <Row className={classes.row}>
          <Tooltip title="Border Left">
            <Button
              color="primary"
              onClick={() => {
                setBorder({
                  ...border,
                  left: {
                    ...border.left,
                    style: border.left.style === 'none' ? borderStyle : 'none',
                    color,
                  },
                });
              }}
              variant={border.left.style === 'none' ? 'outlined' : 'contained'}
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <BorderLeft />
            </Button>
          </Tooltip>

          <Tooltip title="Border Right">
            <Button
              color="primary"
              onClick={() => {
                setBorder({
                  ...border,
                  right: {
                    ...border.right,
                    style: border.right.style === 'none' ? borderStyle : 'none',
                    color,
                  },
                });
              }}
              variant={border.right.style === 'none' ? 'outlined' : 'contained'}
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <BorderRight />
            </Button>
          </Tooltip>

          <Tooltip title="Border Top">
            <Button
              color="primary"
              onClick={() => {
                setBorder({
                  ...border,
                  top: {
                    ...border.top,
                    style: border.top.style === 'none' ? borderStyle : 'none',
                    color,
                  },
                });
              }}
              variant={border.top.style === 'none' ? 'outlined' : 'contained'}
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <BorderTop />
            </Button>
          </Tooltip>

          <Tooltip title="Border Bottom">
            <Button
              color="primary"
              onClick={() => {
                setBorder({
                  ...border,
                  bottom: {
                    ...border.bottom,
                    style: border.bottom.style === 'none' ? borderStyle : 'none',
                    color,
                  },
                });
              }}
              variant={border.bottom.style === 'none' ? 'outlined' : 'contained'}
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <BorderBottom />
            </Button>
          </Tooltip>
        </Row>

        <Row className={classes.row} alignItems="flex-end">
          <Tooltip title="Border Left">
            <Button
              color="primary"
              onClick={() => {
                setBorder({
                  ...border,
                  left: { ...border.left, style: borderStyle, color },
                  right: { ...border.right, style: borderStyle, color },
                  top: { ...border.top, style: borderStyle, color },
                  bottom: { ...border.bottom, style: borderStyle, color },
                });
              }}
              variant="outlined"
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <BorderOuter />
            </Button>
          </Tooltip>

          <Tooltip title="Border Right">
            <Button
              color="primary"
              onClick={() => {
                setBorder({
                  ...border,
                  left: { ...border.left, style: 'none', color },
                  right: { ...border.right, style: 'none', color },
                  top: { ...border.top, style: 'none', color },
                  bottom: { ...border.bottom, style: 'none', color },
                });
              }}
              variant="outlined"
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <BorderClear />
            </Button>
          </Tooltip>

          <FormControl className={`${classes.borderStyle} ${classes.sideMargins}`}>
            <InputLabel id="borderStyle">Border Style</InputLabel>
            <Select
              labelId="borderStyle"
              value={borderStyle}
              onChange={e => setBorderStyle(e.target.value)}
              disabled={useDefaults}
            >
              {borderStyles.map(bs => (
                <MenuItem key={bs} value={bs}>{bs}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Row>

        <Row className={classes.row}>
          <Tooltip title="Font Color">
            <Button
              color="primary"
              onClick={e => setAnchor(e.currentTarget)}
              variant="outlined"
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <BorderColor />
            </Button>
          </Tooltip>
          <Menu
            anchorEl={anchor}
            keepMounted
            open={!!anchor}
            onClose={() => setAnchor(null)}
          >
            <SketchPicker
              color={tmpColor}
              onChange={setTmpColor}
              onChangeComplete={setTmpColor}
              disableAlpha
              presetColors={colors}
              width={250}
            />
            <Row justifyContent="flex-end" className={classes.marginTop}>
              <Button onClick={() => setAnchor(null)} color="primary">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setAnchor(null);
                  setColor(tmpColor.hex);
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

Border.propTypes = {
  useDefaults: PropTypes.bool.isRequired,
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
  }).isRequired,
  setBorder: PropTypes.func.isRequired,
};

export default Border;
