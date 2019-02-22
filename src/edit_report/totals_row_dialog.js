import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import { Add, Delete } from '@material-ui/icons';

const styles = theme => ({
  formControl: {
    marginTop: theme.spacing.unit * 2,
    minWidth: 120,
  },
});

class TotalsRowDialog extends React.Component {
  constructor(props) {
    super(props);

    // var columns = this.props.totals.columns;
    var columns = [{
      letter: 'A',
      value: '',
      str: '',
    }];
    this.state = {
      columns: columns,
    };
  }

  handleChange = (index, {target}) => {
    const value = target.type === 'checkbox' ? target.checked : target.value;
    var columns = this.state.columns;
    columns[index][target.name] = value
    this.setState({
      [target.name]: value,
    });
  }

  handleSave = () => {
    const arr = this.state.columns;
    var columns = {};
    arr.map(column => {
      if (column.value === 0) {
        columns[column.letter] = column.str;
      } else {
        columns[column.letter] = column.value;
      }
    })
    this.props.handleUpdateTotals(this.props.totals.tableIndex, columns);
  }

  handleAddColumn = () => {
    const columns = [
      ...this.state.columns,
      {
        letter: String.fromCharCode(65 + this.state.columns.length),
        value: '',
        str: '',
      }
    ]
    this.setState({
      columns: columns,
    })
  }

  componentDidUpdate(prevProps) {
    if (this.props.totals !== prevProps.totals) {
      var columns = this.props.totals.columns;
      if (typeof columns === 'undefined') {
        columns = []
      } else {
        var arr = []
        for (const [key, value] of Object.entries(columns)) {
          if (typeof value === 'number') {
            arr.push({letter: key, value: value, str: ''});
          } else {
            arr.push({letter: key, value: 0, str: value});
          }
        }
        columns = arr;
      }

      this.setState({
        columns: columns,
      });
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <Dialog
        open={this.props.totals.open}
        onClose={this.props.handleCloseTotals}
      >
        <DialogTitle>{ this.props.totals.reference }</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Specify the column you would like to calculate using its column letter. Every table starts with column A. Feel free to learn more about the <a href="https://exceljet.net/excel-functions/excel-subtotal-function" target="_blank">Excel SUBTOTAL Function</a>.
          </DialogContentText>
          { this.state.columns.map((column, index) => {
            return (
              <div key={index}>
                <TextField id="letter" name="letter"
                  className={classes.formControl}
                  label="Column Letter"
                  value={column.letter}
                  onChange={e => this.handleChange(index, e)}
                />
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="value">Function</InputLabel>
                  <Select
                    value={column.value}
                    onChange={e => this.handleChange(index, e)}
                    inputProps={{
                      name: 'value',
                      id: 'value',
                    }}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>

                    <MenuItem value={0}>String (not a function)</MenuItem>

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
                { column.value === 0 &&
                  <TextField id="str" name="str"
                    className={classes.formControl}
                    label="String"
                    value={column.str}
                    onChange={e => this.handleChange(index, e)}
                  />
                }
              </div>
            )
          }) }
          <Button color="primary" onClick={this.handleAddColumn}>
            <Add className={classNames(classes.leftIcon, classes.iconSmall)} />
            Add Calculation
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleCloseTotals} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

TotalsRowDialog.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TotalsRowDialog);
