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

class DefinitionsTable extends React.Component {
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
			var endpoint = process.env.API_URL + '/subscribe'
			var success = 'Subscribed successfully'
			var failure = 'Failed to subscribe'
		} else if (action == 'unsubscribe') {
			var endpoint = process.env.API_URL + '/unsubscribe'
			var success = 'Unsubscribed successfully'
			var failure = 'Failed to unsubscribe'
		} else if (action == 'notify') {
			var endpoint = process.env.API_URL + '/notify'
			var success = 'Immediate notification request saved successfully'
			var failure = 'Failed to save immediate notification request'
		} else if (action == 'star') {
			var endpoint = process.env.API_URL + '/star'
			var success = 'Added to favorites successfully'
			var failure = 'Failed to add favorite'
		} else if (action == 'unstar') {
			var endpoint = process.env.API_URL + '/unstar'
			var success = 'Removed from favorites successfully'
			var failure = 'Failed to remove favorite'
		}
		fetch(endpoint, {
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
						<TableCell padding="none"></TableCell>
						<TableCell>Name</TableCell>
						{ this.props.showDept && <TableCell>Department</TableCell> }
						<TableCell>Description</TableCell>
						<TableCell>Last Run</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{this.props.reports.map(row => {
						return (
							<SessionContext.Consumer key={row._id}>
							{session => (
								<TableRow key={row._id} hover
								 	onMouseEnter={(e) => this.handleMouseEnter(row._id, e)}
									onMouseLeave={this.handleMouseLeave}
								>
									<TableCell padding="none" className={classes.noWrap} width="96px" height="49px">
										<IconButton color="primary"
										 	onClick={e => this.handleAddRemove(row.starred ? 'unstar' : 'star', session.openSnack, this.props.reload, e)}
											style={{visibility: (row._id != this.state.hoveredReport && !row.starred) ? 'hidden' : 'inherit'}}
										>
											{ row.starred ? <Star /> : <StarBorder /> }
										</IconButton>
										<IconButton color="primary"
										 	onClick={e => this.handleAddRemove(!row.subscribed ? 'subscribe' : (!row.notify ? 'notify' : 'unsubscribe'), session.openSnack, this.props.reload, e)}
											style={{visibility: (row._id != this.state.hoveredReport && !row.subscribed && !row.notify) ? 'hidden' : 'inherit'}}
										>
											{ !row.subscribed ? <NotificationsNone /> : (!row.notify ? <Notifications /> : <NotificationsActive />)}
										</IconButton>
									</TableCell>
									<TableCell className={classes.noWrap} component="th" scope="row">
										<Button onClick={e => session.openReport(row)}>
											{row.name}
										</Button>
									</TableCell>
									{ this.props.showDept && <TableCell>{row.dept}</TableCell> }
									<TableCell>{row.description}</TableCell>
									<TableCell className={classes.noWrap}>
										{row.lastRun ? cleanDate(row.lastRun) : 'Has not run'}
									</TableCell>
								</TableRow>
							)}
							</SessionContext.Consumer>
						);
					})}
				</TableBody>
			</Table>
		);
	}
}

DefinitionsTable.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DefinitionsTable);
