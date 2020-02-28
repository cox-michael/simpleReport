import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  Typography,
  TextField,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  card: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
}));

const NumberFormat = props => {
  const classes = useStyles();
  const { useDefaults, numberFormat, changeNumberFormat } = props;

  return (
    <Card className={classes.card} variant="outlined">
      <CardContent>
        <Typography color="textSecondary">Number Format</Typography>
        <TextField
          label="Number Format"
          value={numberFormat}
          onChange={changeNumberFormat}
          disabled={useDefaults}
        />
      </CardContent>
    </Card>
  );
};

NumberFormat.propTypes = {
  useDefaults: PropTypes.bool.isRequired,
  numberFormat: PropTypes.string.isRequired,
  changeNumberFormat: PropTypes.func.isRequired,
};

export default NumberFormat;
