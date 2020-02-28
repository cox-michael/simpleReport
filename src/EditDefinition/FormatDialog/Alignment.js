import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Input,
  Slider,
  Tooltip,
  Typography,
} from '@material-ui/core';
import {
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatIndentDecrease,
  FormatIndentIncrease,
  VerticalAlignBottom,
  VerticalAlignCenter,
  VerticalAlignTop,
  WrapText,
} from '@material-ui/icons';
import { Row, ToggleButton, ToggleButtonGroup } from '../../components';

const useStyles = makeStyles(theme => ({
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

const Alignment = props => {
  const classes = useStyles();
  const { useDefaults, alignment, setAlignment } = props;

  return (
    <Card className={classes.card} variant="outlined">
      <CardContent>
        <Typography color="textSecondary">Alignment</Typography>

        <Row className={classes.row}>
          <ToggleButtonGroup
            value={alignment.horizontal}
            color="primary"
            onChange={v => setAlignment({ ...alignment, horizontal: v })}
            className={classes.sideMargins}
            disabled={useDefaults}
          >
            <ToggleButton value="left">
              <Tooltip title="Align Left"><FormatAlignLeft /></Tooltip>
            </ToggleButton>
            <ToggleButton value="center">
              <Tooltip title="Align Center"><FormatAlignCenter /></Tooltip>
            </ToggleButton>
            <ToggleButton value="right">
              <Tooltip title="Align Right"><FormatAlignRight /></Tooltip>
            </ToggleButton>
            <ToggleButton value="justify">
              <Tooltip title="Justify Horizontally"><FormatAlignJustify /></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Row>
        <Row className={classes.row}>
          <ToggleButtonGroup
            value={alignment.vertical}
            color="primary"
            onChange={v => setAlignment({ ...alignment, vertical: v })}
            className={classes.sideMargins}
            disabled={useDefaults}
          >
            <ToggleButton value="top">
              <Tooltip title="Align Top"><VerticalAlignTop /></Tooltip>
            </ToggleButton>
            <ToggleButton value="center">
              <Tooltip title="Align Center"><VerticalAlignCenter /></Tooltip>
            </ToggleButton>
            <ToggleButton value="bottom">
              <Tooltip title="Align Bottom"><VerticalAlignBottom /></Tooltip>
            </ToggleButton>
            <ToggleButton value="justify">
              <Tooltip title="Justify Vertically"><FormatAlignJustify /></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Row>
        <Row className={classes.row}>
          <ButtonGroup className={classes.sideMargins} disabled={useDefaults}>
            <Button
              color="primary"
              onClick={() => {
                setAlignment({
                  ...alignment,
                  indent: alignment.indent < 2 ? 0 : alignment.indent - 1,
                });
              }}
            >
              <FormatIndentDecrease />
            </Button>
            <Button
              color="primary"
              onClick={() => setAlignment({ ...alignment, indent: alignment.indent + 1 })}
            >
              <FormatIndentIncrease />
            </Button>
          </ButtonGroup>

          <Tooltip title="Shrink to Fit">
            <Button
              color="primary"
              onClick={() => {
                setAlignment({ ...alignment, shrinkToFit: !alignment.shrinkToFit });
              }}
              variant={alignment.shrinkToFit ? 'contained' : 'outlined'}
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <VerticalAlignCenter style={{ transform: 'rotate(90deg)' }} />
            </Button>
          </Tooltip>

          <Tooltip title="Wrap Text">
            <Button
              color="primary"
              onClick={() => setAlignment({ ...alignment, wrapText: !alignment.wrapText })}
              variant={alignment.wrapText ? 'contained' : 'outlined'}
              className={classes.sideMargins}
              disabled={useDefaults}
            >
              <WrapText />
            </Button>
          </Tooltip>
        </Row>
        <Row className={classes.row} alignItems="center">
          <Typography variant="button" className={`${classes.sideMargins} ${classes.nowrap}`}>Text Rotation</Typography>
          <Slider
            value={alignment.textRotation}
            onChange={(e, v) => setAlignment({ ...alignment, textRotation: v })}
            className={classes.slider}
            marks={[
              {
                value: -90,
                label: '-90°',
              },
              {
                value: 0,
                label: '0°',
              },
              {
                value: 90,
                label: '90°',
              },
            ]}
            min={-90}
            max={90}
            disabled={useDefaults}
          />
          <Input
            value={alignment.textRotation}
            margin="dense"
            className={`${classes.sideMargins} ${classes.num}`}
            onChange={({ target: { value } }) => setAlignment({ ...alignment, textRotation: value === '' ? '' : Number(value) })}
            inputProps={{
              step: 10,
              min: -90,
              max: 90,
              type: 'number',
            }}
            disabled={useDefaults}
          />
        </Row>
      </CardContent>
    </Card>
  );
};

Alignment.propTypes = {
  useDefaults: PropTypes.bool.isRequired,
  alignment: PropTypes.exact({
    horizontal: PropTypes.oneOf(['center', 'centerContinuous', 'distributed', 'fill', 'general', 'justify', 'left', 'right']),
    indent: PropTypes.number, // Number of spaces to indent = indent value * 3
    // justifyLastLine: false,
    // readingOrder: ['contextDependent', 'leftToRight', 'rightToLeft'],
    // relativeIndent: integer, // number of additional spaces to indent
    shrinkToFit: PropTypes.bool,
    textRotation: PropTypes.number, // number of degrees to rotate text counter-clockwise
    vertical: PropTypes.oneOf(['bottom', 'center', 'distributed', 'justify', 'top']),
    wrapText: PropTypes.bool,
  }).isRequired,
  setAlignment: PropTypes.func.isRequired,
};

export default Alignment;
