import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { SessionContext } from "./session";
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import AddIcon from '@material-ui/icons/Add';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const styles = theme => ({
  card: {
    width: 800,
    marginBottom: theme.spacing.unit * 2,
  },
  content: {
    width: 712,
  },
  author: {
    fontSize: 14,
    marginTop: theme.spacing.unit * 2,
  },
	button: {
		// margin: theme.spacing.unit,
    fontSize: 42,
	},
	iconButton: {
		padding: theme.spacing.unit / 2,
	},
	buttons: {
		marginBottom: theme.spacing.unit,
		textAlign: 'right',
	},
  floating: {
    position: 'fixed',
    top: theme.spacing.unit * 10,
    right: theme.spacing.unit * 3,
  },
});

class Requests extends React.Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      requests: [],
      clicked: false,
      open: false,
      submitting: false,
      description: "",
    };
  }

  handleClick = () => {
    console.log('clicked');
    this.setState({
      clicked: !this.state.clicked,
    })
  }

  handleVote = (direction, request_id) => {
    // this.setState({
    //   voting: true,
    // });

    fetch(process.env.API_URL + 'requestVote', {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        direction: direction,
        request_id: request_id,
      })
    })
      .then(response => response.json())
      .then(data => {
        if (!data.isLoggedIn){
          this.context.handleLoginStatusChange(false);
          return;
        }
        // this.setState({
        //   submitting: false,
        //   open: false,
        // })
        this.getRequests();
      });
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleCancel = () => {
    this.setState({ open: false });
  };

	handleChange = ({ target }) => {
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({
			[target.name]: value
		});
	}

  getRequests = () => {
    this.setState({
      loading: true,
    });
    fetch(process.env.API_URL + 'api/getRequests', {
      credentials: "same-origin"
    })
    .then(response => response.json())
    .then(response => {
      if (!response.isLoggedIn){
        this.context.handleLoginStatusChange(false);
        return;
      }
      this.setState({
        requests: response.data,
        loading: false,
      })
    });
  }

  postRequest = () => {
    this.setState({
      submitting: true,
    });
    fetch(process.env.API_URL + 'createNewRequest', {
      method: 'POST',
      credentials: "same-origin",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: this.state.description,
      })
    })
      .then(response => response.json())
      .then(data => {
        if (!data.isLoggedIn){
          this.context.handleLoginStatusChange(false);
          return;
        }
				var snackMsg = data.success ? 'Request saved successfully' : 'Failed to save request'
				this.context.openSnack(snackMsg);
        this.setState({
          submitting: false,
          open: false,
        })
        this.getRequests();
      });
  }

  componentDidMount() {
    this.getRequests();
  }

  render() {
    const classes = this.props.classes;

    return (
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleClickOpen}
          className={classes.floating}
        >
          <AddIcon />
          New Feature Request
        </Button>
        <Dialog
          disableBackdropClick
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">New Feature Request</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please describe your desired feature request or bug fix in detail.
            </DialogContentText>
            <TextField
              autoFocus
              multiline
              margin="normal"
              id="description"
              name="description"
              label="Description"
              value={this.state.description}
              onChange={this.handleChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={this.postRequest} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>



        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="center"
        >
          {this.state.requests.map(request => {
            return(
            <Card className={classes.card} key={request._id}>
              <Grid container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
              >
                <CardActions>
                  <Grid container
                    direction="column"
                    justify="flex-start"
                    alignItems="center"
                  >
          					<IconButton
          					 	color={ request.upvoted ? "primary" : "default"}
                      className={classes.iconButton}
          						onClick={e => this.handleVote(
                        request.upvoted ? "remove" : "up",
                        request._id
                      )}
          					>
                      <ArrowDropUp className={classes.button} />
          					</IconButton>
                    <Typography color="textSecondary" variant="h5">
                      {request.votes}
                    </Typography>
          					<IconButton
          					 	color={ request.downvoted ? "primary" : "default"}
                      className={classes.iconButton}
          						onClick={e => this.handleVote(
                        request.downvoted ? "remove" : "down",
                        request._id
                      )}
          					>
                      <ArrowDropDown className={classes.button} />
          					</IconButton>
                  </Grid>
                </CardActions>
                <CardContent className={classes.content}>
                  <Typography component="p">
                    {request.description}
                  </Typography>
                  <Typography
                    className={classes.author}
                    color="textSecondary"
                  >
                    Author: {request.author}
                  </Typography>
                </CardContent>
              </Grid>
            </Card>
            );
          })}
        </Grid>
      </div>
    );
  }
}

Requests.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Requests);
