import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { Fingerprint } from '@material-ui/icons';
import { SessionContext } from "./session";
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import CircularProgress from '@material-ui/core/CircularProgress';
import green from '@material-ui/core/colors/green';

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit * 6,
	},
	button: {
		marginTop: theme.spacing.unit * 3,
	},
  progress: {
    // color: green[500],
    position: 'relative',
    top: 24,
    left: -39,
    zIndex: 10000,
  },
});

var cleanDate = function(mongoDate){
	var format = {hour: '2-digit', minute:'2-digit'};
	mongoDate = new Date(mongoDate);
	mongoDate = mongoDate.toLocaleDateString([], format);
	return mongoDate.replace(',', ' at')
}

class Superpower extends React.Component {
	static contextType = SessionContext;
	constructor(props) {
		super(props);
	  this.state = {
			username: '',
			fetching: false,
			fetchSuccess: false,
	  };
	};

	handleChange = ({ target }) => {
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({
			[target.name]: value
		});
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({
			fetching: true,
			fetchSuccess: false,
		})
		fetch(process.env.API_URL + 'superpower', {
			method: 'POST',
			credentials: "same-origin",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: this.state.username,
			})
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					this.context.handleLoginStatusChange(
						data.isLoggedIn,
						data.displayName,
						data.superpower,
						data.analyst
					);
					this.setState({
						fetching: false,
						fetchSuccess: true,
					});
				} else {
					this.context.handleLoginStatusChange(data.isLoggedIn);
				}

				var snackMsg = data.success ? 'User changed' : 'Your superpowers have failed you'
				this.context.openSnack(snackMsg);

				setTimeout(() => {
					this.setState({
						fetching: false,
						fetchSuccess: false,
					})
				}, 6000)
			});
	};

	render() {
		const { classes } = this.props;

		return (
			<Paper className={classes.paper}>
				<Typography variant='h4' gutterBottom>
					Superpower
				</Typography>
				<Typography>
					This gives you the ability to view the site from the perspective<br/>
					of someone else. You can see which reports they have access to<br/>
					and which ones they don't.<br/>
				</Typography>
				<br/>
				<Divider />
				<form onSubmit={this.handleSubmit}>
					<FormControl margin="normal">
						<InputLabel htmlFor="username">Username</InputLabel>
						<Input
						 	id="username"
							name="username"
							value={this.state.username}
							onChange={this.handleChange}
							autoFocus />
					</FormControl>
					<IconButton
					 	color="primary"
						onClick={this.handleSubmit}
						className={classes.button}>
						{this.state.fetchSuccess ? <CheckIcon /> : <Fingerprint />}
					</IconButton>
					{ this.state.fetching &&
						 	<CircularProgress size={30} className={classes.progress} />
					}
				</form>
			</Paper>
		);
	}
}

Superpower.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Superpower);
