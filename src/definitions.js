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

class Definitions extends React.Component {
  static contextType = SessionContext;
	constructor(props) {
		super(props);
		this.state = {
			data: {
				isLoggedIn: false,
				loading: true,
				reports: []
			}
		}
	}

	reload = (keep='') => {
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
			})
		});
	}

	componentDidMount() {
		this.reload();
	}

	render() {
		const classes = this.props.classes;

		if (this.props.filter == 'none'){
			return (
				<div>
					<Button variant="contained" color="primary" className={classes.button}>
						<AddIcon />
						Request New Report
					</Button>
					<Link to={process.env.API_URL + "/createNewReport"} style={{textDecoration: 'none'}}>
						<Button variant="contained" color="primary" className={classes.button}>
							<AddIcon />
							Create New Report
						</Button>
					</Link>
					{[...new Set(this.state.data.reports.map(report => report.dept))].sort().map(dept => (

						<ExpansionPanel key={dept}>
							<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
								<Typography>{dept}</Typography>
							</ExpansionPanelSummary>
							<ExpansionPanelDetails>
								<DefinitionsTable
								 	reports={this.state.data.reports.filter(report => report.dept == dept)}
									reload={this.reload} />
							</ExpansionPanelDetails>
						</ExpansionPanel>

					))}
				</div>
			)
		} else {
			return (
					<Paper className={classes.paper}>
						<DefinitionsTable
						 	reports={this.state.data.reports.filter(report => report[this.props.filter] || report._id == this.state.keep)}
							reload={this.reload}
							showDept />
					</Paper>
			)
		}
	}
}

Definitions.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Definitions);
