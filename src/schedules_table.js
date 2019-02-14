import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Star,
	 			 StarBorder,
				 Notifications,
				 NotificationsActive,
				 NotificationsNone } from '@material-ui/icons';
import { SessionContext } from "./session";
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

const styles = theme => ({
	root: {
		width: '100%',
		marginTop: theme.spacing.unit * 3,
		overflowX: 'auto',
	},
	table: {
		minWidth: 700,
	},
	iconSmall: {
		fontSize: 20,
	},
	noWrap: {
		whiteSpace: 'nowrap',
	},
});

var cleanDate = function(mongoDate){
	var format = {hour: '2-digit', minute:'2-digit'};
	mongoDate = new Date(mongoDate);
	mongoDate = mongoDate.toLocaleDateString([], format);
	return mongoDate.replace(',', ' at')
}

var properList = (list) => {
	return [list.slice(0, -1).join(', '), list.slice(-1)[0]].join(list.length < 2 ? '' : ' & ');
}

var getOridnal = (nArray) => {
  var newArray = [];
  nArray.map(n =>{
    newArray.push(n + ([,'st','nd','rd'][n%100>>3^1&&n%10]||'th'));
  })
  return newArray;
}

class SchedulesTable extends React.Component {
  static contextType = SessionContext;
	constructor(props) {
		super(props);
	  this.state = {
			openReport: false,
			hoveredReport: ''
	  };
	};

	handleClickOpen = (name) => {
		this.setState({
			openReport: true,
			name: name,
		});
	};

	handleAddRemove = (action, openSnack, reload, { target }) => {
		if (action == 'subscribe') {
			var success = 'Subscribed successfully'
			var failure = 'Failed to subscribe'
		} else if (action == 'unsubscribe') {
			var success = 'Unsubscribed successfully'
			var failure = 'Failed to unsubscribe'
		} else if (action == 'notify') {
			var success = 'Immediate notification request saved successfully'
			var failure = 'Failed to save immediate notification request'
		} else if (action == 'star') {
			var success = 'Added to favorites successfully'
			var failure = 'Failed to add favorite'
		} else if (action == 'unstar') {
			var success = 'Removed from favorites successfully'
			var failure = 'Failed to remove favorite'
		}
		fetch(process.env.API_URL + 'api/' + action, {
			method: 'POST',
			credentials: "same-origin",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				reportId: this.state.hoveredReport,
			})
		})
			.then(response => response.json())
			.then(data => {
				if (!data.isLoggedIn){
					this.context.handleLoginStatusChange(false);
					return;
				}

				var snackMsg = data.success ? success : failure
				openSnack(snackMsg);
				this.setState({saved: data.success});
				reload(this.state.hoveredReport);
			});
	};

	handleMouseEnter = (rowId, {target}) => {
		this.setState({ hoveredReport: rowId});
	};

	handleMouseLeave = () => {
		this.setState({ hoveredReport: ''});
	};

	render() {
		const { classes } = this.props;

		return (
			<Table className={classes.table}>
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell>Schedule</TableCell>
						<TableCell>Last Run</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{this.props.schedules.map((row, idx) => {
						if (row.schedules.freq == '') return
						return (
							<TableRow key={row._id + idx} hover
							 	onMouseEnter={(e) => this.handleMouseEnter(row._id, e)}
								onMouseLeave={this.handleMouseLeave}
							>
								<TableCell className={classes.noWrap} component="th" scope="row">
									<Button onClick={e => this.context.openReport(row)}>
										{row.name}
									</Button>
								</TableCell>
								<TableCell>
									{row.schedules.freq[0].toUpperCase() + row.schedules.freq.substring(1, row.schedules.freq.length)}

									{row.schedules.freq == 'weekly' && " on " }
									{properList(row.schedules.weekday)}

									{row.schedules.freq == 'yearly' && " in " }
									{properList(row.schedules.month)}

									{(row.schedules.freq == 'monthly' ||
									 	row.schedules.freq == 'yearly') && " on the " }
									{properList(getOridnal(row.schedules.day))}

									{" in the "}
									{properList(row.schedules.time)}
								</TableCell>
								<TableCell className={classes.noWrap}>
									{row.lastRun ? cleanDate(row.lastRun) : 'Has not run'}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		);
	}
}

SchedulesTable.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SchedulesTable);
