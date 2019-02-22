import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

const styles = {
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class QueryDialog extends React.Component {
  constructor(props) {
		super(props);

    this.state = {
      query: this.props.query.query,
    }
	}

  handleChange = ({target}) => {
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [target.name]: value,
    });
  }

  handleSave = () => {
    this.props.handleUpdateQuery(
      this.props.query.dsIndex,
      this.state.query
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.query.query !== prevProps.query.query) {
      this.setState({
        query: this.props.query.query,
      })
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <Dialog
        fullScreen
        open={this.props.query.open}
        onClose={this.props.handleCancelQuery}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton color="inherit" onClick={this.props.handleCancelQuery}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.flex}>
              { this.props.query.reference }
            </Typography>
            <Button color="inherit" onClick={this.handleSave}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <FormControl margin="normal" fullWidth>
          <TextField id="query" name="query"
            label="Query"
            multiline
            value={this.state.query}
            onChange={this.handleChange} />
        </FormControl>
      </Dialog>
    );
  }
}

QueryDialog.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(QueryDialog);
