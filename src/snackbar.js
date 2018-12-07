import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { SessionContext } from "./session";
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';

import red from '@material-ui/core/colors/red';
import amber from '@material-ui/core/colors/amber';
import green from '@material-ui/core/colors/green';

const styles = theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    // backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
    opacity: 0.9,
    marginRight: theme.spacing.unit,
  },
  message: {
    display: 'flex',
  },
});

class Snack extends React.Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: []
    };
  }

  // handleClick = () => {
  //
  // }
  //
  // getRequest = () => {
  //   this.setState({
  //     loading: true,
  //   });
  //   fetch(process.env.API_URL + '/endpoint', {
  //     credentials: "same-origin"
  //   })
  //   .then(response => response.json())
  //   .then(data => {
  //     if (!data.isLoggedIn){
  //       this.context.handleLoginStatusChange(false);
  //       return;
  //     }
  //     this.setState({
  //       loading: false,
  //       data: data,
  //     })
  //   });
  // }
  //
  // postRequest = () => {
  //   this.setState({
  //     loading: true,
  //   });
  //   fetch(process.env.API_URL + '/endpoint/', {
  //     method: 'POST',
  //     credentials: "same-origin",
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       data: 'data',
  //     })
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       if (!data.isLoggedIn){
  //         this.context.handleLoginStatusChange(false);
  //         return;
  //       }
  //       this.setState({
  //         loading: false,
  //         data: data
  //       })
  //     });
  // }
  //
  // componentDidMount() {
  //
  // }

  render() {
    const classes = this.props.classes;

    return (
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }}
        open={this.props.open}
        autoHideDuration={6000}
        onClose={this.props.closeSnack}
        ContentProps={{ 'aria-describedby': 'message-id', }}
      >
        <SnackbarContent
          className={classes[this.props.type]}
          message={
            <span id="message-id" className={classes.message}>
            {this.props.type == 'success' && <CheckCircleIcon className={classes.icon} />}
            {this.props.type == 'error' && <ErrorIcon className={classes.icon} />}
              {this.props.msg}
            </span>
          }
          action={[
            <IconButton key="close" aria-label="Close" color="inherit"
              onClick={this.props.closeSnack}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </Snackbar>
    );
  }
}

Snack.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Snack);
