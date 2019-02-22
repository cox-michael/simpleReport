import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  formControl: {
    marginTop: theme.spacing.unit * 2,
    minWidth: 120,
  },
});

class RowBandingDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      useDefaults: true,
      primaryBackground: '#333333',
      secondaryBackground: '#FFFFFF',
      primaryFont: '#FFFFFF',
      secondaryFont: '#333333',
    };
  }

  handleChange = ({target}) => {
      if (target.type === 'checkbox') {
        var value = target.checked;
      } else {
        var value = target.value;
        while (value.includes('##')) {
          value = value.replace('##', '#');
        }
        value = value.charAt(0) !== '#' ? '#' + value : value;
        value = value.toUpperCase();
      }

    this.setState({
      [target.name]: value,
    });
  }

  handleSave = () => {
    const rowBandingColors = {
      useDefaults: this.state.useDefaults,
      background: [
        this.state.primaryBackground,
        this.state.secondaryBackground
      ],
      font: [
        this.state.primaryFont,
        this.state.secondaryFont
      ],
    }
    this.props.handleUpdateRowBanding(
      this.props.rowBanding.tableIndex,
      rowBandingColors
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.rowBanding !== prevProps.rowBanding) {
      console.log(this.props.rowBanding);
      const colors = this.props.rowBanding.colors;
      this.setState({
        useDefaults: colors.useDefaults,
        primaryBackground: colors.background[0],
        secondaryBackground: colors.background[1],
        primaryFont: colors.font[0],
        secondaryFont: colors.font[1],
      });
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <Dialog
        open={this.props.rowBanding.open}
        onClose={this.props.handleCloseRowBanding}
      >
        <DialogTitle>{ this.props.rowBanding.reference }</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can specify the hex color values you wish to use or you can use the defaults set by the site administrator.
            <br/>
            Please test your colors in Excel because the colors are not rendered the same as they are on the web.
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox id="useDefaults" name="useDefaults"
                checked={this.state.useDefaults}
                color="primary"
                onChange={this.handleChange}/>
            }
            label="Use Default Colors"
          />
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Background Color</TableCell>
                <TableCell>Font Color</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row"
                  style={{
                    backgroundColor: this.state.primaryBackground,
                    color: this.state.primaryFont,
                  }}
                >
                  Primary Band
                </TableCell>
                <TableCell>
  								<TextField id="primaryBackground" name="primaryBackground"
  									value={this.state.primaryBackground}
                    disabled={this.state.useDefaults}
  									onChange={this.handleChange}
                  />
                </TableCell>
                <TableCell>
  								<TextField id="primaryFont" name="primaryFont"
  									value={this.state.primaryFont}
                    disabled={this.state.useDefaults}
  									onChange={this.handleChange}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row"
                  style={{
                    backgroundColor: this.state.secondaryBackground,
                    color: this.state.secondaryFont,
                  }}
                >
                  Secondary Band
                </TableCell>
                <TableCell>
  								<TextField id="secondaryBackground"
                    name="secondaryBackground"
  									value={this.state.secondaryBackground}
                    disabled={this.state.useDefaults}
  									onChange={this.handleChange}
                  />
                </TableCell>
                <TableCell>
                  <TextField id="secondaryFont" name="secondaryFont"
                    value={this.state.secondaryFont}
                    disabled={this.state.useDefaults}
                    onChange={this.handleChange}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleCloseRowBanding} color="primary">
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

RowBandingDialog.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RowBandingDialog);
