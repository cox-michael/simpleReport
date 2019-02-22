import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { SessionContext } from "./session";
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import { Add, Delete } from '@material-ui/icons';
import classNames from 'classnames';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';

const styles = theme => ({
  root: {
    margin: theme.spacing.unit,
  },
	leftIcon: {
		marginRight: theme.spacing.unit,
	},
	iconSmall: {
		fontSize: 20,
	},
});

class DataSources extends React.Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      dataSources: [],
      dialogOpen: false,
      _id: '',
      name: '',
      connectionString: '',
    };
  }

  handleChange = ({ target }) => {
    var value = target.type === 'checkbox' ? target.checked : target.value;


    var value = target.name === 'name' ? value.substring(0, 24) : value;

    this.setState({
      [target.name]: value
    });
  }

  handleEdit = (_id='', name='', connectionString='') => {
    this.setState({
      _id: _id,
      name: name,
      connectionString: connectionString,
    })
    this.handleDialogOpen();
  }

  handleDialogOpen = () => {
    this.setState({
      dialogOpen: true,
    })
  }

  handleClose = () => {
    this.setState({
      dialogOpen: false,
      _id: '',
      name: '',
      connectionString: '',
    });
  }

  getDataSources = () => {
    this.setState({
      loading: true,
    });
    fetch(process.env.API_URL + 'api/getDataSourcesFull', {
      credentials: "same-origin"
    })
    .then(response => response.json())
    .then(response => {
      if (!response.isLoggedIn){
        this.context.handleLoginStatusChange(false);
        return;
      }
      this.setState({
        loading: false,
        dataSources: response.data,
      })
    });
  }

  postDataSource = () => {
    this.setState({
      loading: true,
    });
    fetch(process.env.API_URL + 'api/postDataSource', {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: this.state._id,
        name: this.state.name,
        connectionString: this.state.connectionString,
      })
    })
      .then(response => response.json())
      .then(data => {
        if (!data.isLoggedIn){
          this.context.handleLoginStatusChange(false);
          return;
        }
        this.setState({
          loading: false,
          dataSources: data.data,
          dialogOpen: false,
          _id: '',
          name: '',
          connectionString: '',
        })
      });
  }

  deleteDataSource = () => {
    this.setState({
      loading: true,
    });
    fetch(process.env.API_URL + 'api/deleteDataSource', {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: this.state._id,
      })
    })
      .then(response => response.json())
      .then(data => {
        if (!data.isLoggedIn){
          this.context.handleLoginStatusChange(false);
          return;
        }
        this.setState({
          loading: false,
          dataSources: data.data,
          dialogOpen: false,
          _id: '',
          name: '',
          connectionString: '',
        })
      });
  }

  componentDidMount() {
    this.getDataSources();
  }

  render() {
    const classes = this.props.classes;

    return (
      <Paper>
        <List component="nav">
        { this.state.dataSources.map(ds => {
          return (
              <ListItem
                key={ ds._id }
                onClick={e => this.handleEdit(
                  ds._id,
                  ds.name,
                  ds.connectionString,
                  e)}
                button
              >
                <ListItemText
                  primary={ ds.name }
                  secondary={ ds.connectionString }
                />
              </ListItem>
          )
        })}
        </List>
        <Button color="primary" onClick={this.handleDialogOpen}>
          <Add className={classNames(classes.leftIcon, classes.iconSmall)} />
          New Data Source
        </Button>

        <Dialog
          open={this.state.dialogOpen}
          onClose={this.handleClose}
        >
          <DialogTitle>New Data Source</DialogTitle>
          <DialogContent>
              <FormControl margin="normal" required>
                <InputLabel htmlFor="name">Data Source Name</InputLabel>
                <Input id="name" name="name" value={this.state.name} onChange={this.handleChange} autoFocus />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="connectionString">Connection String</InputLabel>
                <Input id="connectionString" name="connectionString" value={this.state.connectionString} onChange={this.handleChange} />
              </FormControl>
          </DialogContent>
          <DialogActions>
            { this.state._id !== '' &&
            <Button color="secondary" onClick={this.deleteDataSource}>
              <Delete className={classNames(classes.leftIcon, classes.iconSmall)} />
              Delete
            </Button>
            }
            <Button onClick={this.handleClose}>
              Cancel
            </Button>
            <Button onClick={this.postDataSource} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    );
  }
}

DataSources.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DataSources);
