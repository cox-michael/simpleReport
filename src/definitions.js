import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DefinitionsTable from './definitions_table';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import { SessionContext } from "./session";
import { Star, Notifications } from '@material-ui/icons';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
	button: {
		marginLeft: theme.spacing.unit,
	},
	buttons: {
		marginBottom: theme.spacing.unit,
		textAlign: 'right',
	},
	paper: {
		marginBottom: theme.spacing.unit * 4,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'left',
		padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
	},
	paperDesc: {
		marginBottom: theme.spacing.unit * 2,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'left',
		padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
		backgroundColor: 'lightgray',
	},
	card: {
		minWidth: 275,
	},
	icon: {
		marginBottom: -5,
	},
});

class Definitions extends React.Component {
  static contextType = SessionContext;
	constructor(props) {
		super(props);
		this.state = {
			data: {
				isLoggedIn: false,
				loading: true,
				reports: []
			},
			loading: true,
		}
	}

	reload = (keep='') => {
		return new Promise((resolve, reject) => {
			fetch(process.env.API_URL + '/getReports', {
				credentials: "same-origin"
			})
			.then(response => response.json())
			.then(data => {
				if (!data.isLoggedIn){
					console.log('Not logged in');
					this.context.handleLoginStatusChange(false);
					return;
				}
				this.setState({
					data: data,
					keep: keep,
					loading: false,
				})
			})
			.then(() => resolve());
		});
	}

	componentDidMount() {
		this.reload()
		.then(() => {
			if (typeof this.props.match.params.definition_id !== "undefined"){
				if (!this.state.loading) {
					var reports = this.state.data.reports;
					var definition_id = this.props.match.params.definition_id;
					var report = reports.filter(report => report._id == definition_id)[0];
					this.context.openReport(report);
				}
			}
		})
	}

	render() {
		const classes = this.props.classes;
		var reports = this.state.data.reports;

		// if (this.state.loading) {
		// 	<CircularProgress size={100} color='primary' />
		// }
		if (this.props.filter == 'none' || this.props.filter == null){
			return (
				<div>
					{ !reports.length &&
					<Paper className={classes.paper}>
						<Typography>
							It looks like you don't have access to any reports yet.
						</Typography>
					</Paper>
					}
					{ this.context.loginState.analyst &&
					<div className={classes.buttons}>
						<Link
						 	to={process.env.API_URL + "/createNewReport"}
							style={{textDecoration: 'none'}}>
							<Button
							 	variant="contained"
								color="primary"
								className={classes.button}>
								<AddIcon />
								Create New Report
							</Button>
						</Link>
					</div>
					}
					{[...new Set(reports.map(report => report.dept))].sort().map(dept => (

						<ExpansionPanel key={dept} defaultExpanded={ reports.length == 1 }>
							<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
								<Typography>{dept}</Typography>
							</ExpansionPanelSummary>
							<ExpansionPanelDetails>
								<DefinitionsTable
								 	reports={reports.filter(report => report.dept == dept)}
									reload={this.reload} />
							</ExpansionPanelDetails>
						</ExpansionPanel>

					))}
				</div>
			)
		} else {
			if (
				!reports.filter(
					report =>
						report[this.props.filter] ||
						report._id == this.state.keep
				).length) {
				return (
						<Paper className={classes.paper}>
							<Typography>
								You haven't&nbsp;
								{this.props.filter}&nbsp;
								{this.props.filter == 'starred' ?
								 	<span>
										(<Star color='primary' className={classes.icon} />)
									</span>
									:
									<span>
										(<Notifications color='primary' className={classes.icon} />
										) to
									</span>
								}&nbsp;
								any reports yet.
								Go back to&nbsp;
								<Link to={process.env.API_URL + "/"}>
									all reports
								</Link> to add some.</Typography>
						</Paper>
				)
			} else {
				return (
						<Paper className={classes.paper}>
							<DefinitionsTable
							 	reports={reports.filter(report => report[this.props.filter] || report._id == this.state.keep)}
								reload={this.reload}
								showDept />
						</Paper>
				)
			}
		}
	}
}

Definitions.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Definitions);
