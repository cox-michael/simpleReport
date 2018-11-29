import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Fingerprint } from '@material-ui/icons';
import { SessionContext } from "./session";
import IconButton from '@material-ui/core/IconButton';
// import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
	paper: {
		padding: theme.spacing.unit * 6,
	},
	button: {
		marginTop: theme.spacing.unit * 3,
	},
	// noWrap: {
	// 	whiteSpace: 'nowrap',
	// },
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
	  };
	};

	handleChange = ({ target }) => {
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({
			[target.name]: value
		});
	}

	handleSubmit = () => {
		fetch(process.env.API_URL + '/superpower', {
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
					this.context.handleLoginStatusChange(data.isLoggedIn, data.displayName, data.superpower);
				} else {
					this.context.handleLoginStatusChange(data.isLoggedIn);
				}

				var snackMsg = data.success ? 'User changed' : 'Your superpowers have failed you'
				this.context.openSnack(snackMsg);
			});
	};

	render() {
		const { classes } = this.props;

		return (
			<Paper className={classes.paper}>
				<Typography>
					Explain what this is
				</Typography>
				<br/>
				<Divider />
				<FormControl margin="normal">
					<InputLabel htmlFor="username">Username</InputLabel>
					<Input id="username" name="username" value={this.state.username} onChange={this.handleChange} autoFocus />
				</FormControl>
				<IconButton color="primary" onClick={this.handleSubmit} className={classes.button}>
					<Fingerprint />
				</IconButton>
			</Paper>
		);
	}
}

Superpower.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Superpower);
