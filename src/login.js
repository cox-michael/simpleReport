import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
	layout: {
		width: 'auto',
		display: 'block', // Fix IE 11 issue.
		marginLeft: theme.spacing(1) * 3,
		marginRight: theme.spacing(1) * 3,
		[theme.breakpoints.up(400 + theme.spacing(1) * 3 * 2)]: {
			width: 400,
			marginLeft: 'auto',
			marginRight: 'auto',
		},
	},
	paper: {
		marginTop: theme.spacing(1) * 8,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: `${theme.spacing(1) * 2}px ${theme.spacing(1) * 3}px ${theme.spacing(1) * 3}px`,
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		marginTop: theme.spacing(1) * 3,
	},
});

class SignIn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			attempted: false,
			username: "",
			password: "",
			data: []
		};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange({ target }) {
		this.setState({
			[target.name]: target.value
		});
	}

	handleSubmit(e) {
		e.preventDefault();
		var inv = document.getElementById("invalid")
		if (inv) {
			inv.classList.remove('blink_me');
			void inv.offsetWidth;
			inv.classList.add('blink_me');
		}
		this.setState({
			attempted: true,
			pw: ''
		});

		fetch(process.env.API_URL + 'login', {
			method: 'POST',
			credentials: "same-origin",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: this.state.username,
				password: this.state.password,
			})
		})
			.then(response => response.json())
			.then(data => {
				this.props.handleLoginStatusChange(data.isLoggedIn,
					 																 data.displayName,
																					 data.superpower,
																				   data.analyst);
			});
	}

	render() {
		return (
			<React.Fragment>
				<CssBaseline />
				<main className={this.props.classes.layout}>
					<Paper className={this.props.classes.paper}>
						<Avatar className={this.props.classes.avatar}>
							<LockIcon />
						</Avatar>
						<Typography component="h1" variant="h5">
							Sign in
						</Typography>
						<form className={this.props.classes.form} onSubmit={ this.handleSubmit }>
							<FormControl margin="normal" required fullWidth>
								<InputLabel htmlFor="username">Username</InputLabel>
								<Input id="username" name="username" autoComplete="username" value={this.state.username} onChange={this.handleChange} autoFocus />
							</FormControl>
							<FormControl margin="normal" required fullWidth>
								<InputLabel htmlFor="password">Password</InputLabel>
								<Input
									name="password"
									type="password"
									id="password"
									autoComplete="current-password"
									onChange={this.handleChange}
								/>
							</FormControl>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								color="primary"
								className={this.props.classes.submit}
							>
								Sign in
							</Button>
						</form>
					</Paper>
				</main>
			</React.Fragment>
		);
	}
}

SignIn.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SignIn);
