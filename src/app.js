import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
//import SignIn from './signin'
import SignIn from './login'
import Layout from './layout'
import { SessionProvider } from "./session";
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			isLoggedIn: false,
			superpower: false,
			analyst: false,
			// username: null,
			displayName: '',
		};

		this.handleLoginStatusChange = this.handleLoginStatusChange.bind(this);
	}

	componentDidMount() {
		fetch(process.env.API_URL + 'loggedIn', {
			credentials: "same-origin"
		})
			.then(response => response.json())
			.then(data => this.setState({
				isLoggedIn: data.isLoggedIn,
				displayName: data.displayName,
				superpower: data.superpower,
				analyst: data.analyst,
				loading: false
			}));
	}

	handleLoginStatusChange(isLoggedIn,
		 											displayName=this.state.displayName,
													superpower=this.state.superpower,
													analyst=this.state.analyst) {
		this.setState({
			isLoggedIn: isLoggedIn,
			displayName: displayName,
			superpower: superpower,
			analyst: analyst,
		});
	}

	render() {
		if (this.state.loading) {
			return (
				<Dialog open>
					<DialogContent>
						<CircularProgress
						 	style={{ margin: '100px', width: '60px', height: '60px' }} />
						<DialogContentText style={{ textAlign: 'center' }}>
							Checking login status
						</DialogContentText>
					</DialogContent>
				</Dialog>
			)
		} else if (this.state.isLoggedIn) {
			const loginState = {
				isLoggedIn: this.state.isLoggedIn,
				displayName: this.state.displayName,
				superpower: this.state.superpower,
				analyst: this.state.analyst,
			};
			return (
				<Router>
					<SessionProvider
						loginState={ loginState }
						handleLoginStatusChange={ this.handleLoginStatusChange }>
						<Layout />
					</SessionProvider>
				</Router>
			)
		} else {
			return <SignIn handleLoginStatusChange={ this.handleLoginStatusChange } />
		}
	}
}
export default App;
