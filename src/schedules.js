import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SchedulesTable from './schedules_table';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import { SessionContext } from "./session";

const styles = theme => ({
	button: {
		marginRight: theme.spacing.unit,
		marginBottom: theme.spacing.unit,
		marginLeft: theme.spacing.unit,
	},
	paper: {
		marginBottom: theme.spacing.unit * 4,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'left',
		padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
	},
});

class Schedules extends React.Component {
  static contextType = SessionContext;
	constructor(props) {
		super(props);
		this.state = {
			data: {
				isLoggedIn: false,
				loading: true,
				schedules: []
			}
		}
	}

	reload = (keep='') => {
		fetch(process.env.API_URL + 'api/getSchedules', {
			credentials: "same-origin"
		})
		.then(response => response.json())
		.then(data => {
			if (!data.isLoggedIn){
				console.log('Not logged in');
				this.context.handleLoginStatusChange(false);
				return;
			}
			data.schedules = data.data;
			this.setState({
				data: data,
				keep: keep,
			})
		});
	}

	componentDidMount() {
		this.reload();
	}

	render() {
		const classes = this.props.classes;

		if (!this.state.data.schedules.length) {
			return (
					<Paper className={classes.paper}>
						<Typography>
							It looks like none of the reports you have access to are scheduled.
						</Typography>
					</Paper>
			)
		} else {
			return (
					<Paper className={classes.paper}>
						<SchedulesTable
						 	schedules={this.state.data.schedules}
							reload={this.reload}
							showDept />
					</Paper>
			)
		}
	}
}

Schedules.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Schedules);
