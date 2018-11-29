import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { SessionContext } from "./session";
import CircularProgress from '@material-ui/core/CircularProgress';
import Definitions from './definitions';

class Download extends React.Component {
	constructor(props) {
		super(props);
		console.log(this.props.match.params.report_id);
	}

	componentDidMount() {
		console.log('mounted');
		window.location.href = process.env.API_URL + '/downloadReport/' + this.props.match.params.report_id;
	}

	render() {
		return <Definitions filter="none" />
	}
}

export default Download;
