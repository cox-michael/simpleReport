import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Link } from 'react-router-dom'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = theme => ({
	root: {
		width: '100%',
		marginTop: theme.spacing.unit * 3,
		overflowX: 'auto',
	},
	table: {
		minWidth: 500,
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

class ViewSingleReport extends React.Component {
	constructor(props) {
		super(props);
	};

	download(reportId, {target}) {
		window.open("http://" + process.env.FULL_URL + "/downloadReport/" + reportId, "_self");
	}

  render() {
		const classes = this.props.classes;

    return (
        <Dialog
          open={this.props.report.open}
          onClose={this.props.fn.closeReport}
					scroll="paper"
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{this.props.report.report.name}</DialogTitle>
          <DialogContent>
            <DialogContentText>{this.props.report.report.description}</DialogContentText>
						<Table className={classes.table}>
							<TableHead>
								<TableRow>
									<TableCell>Name</TableCell>
									<TableCell>Date Run</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{this.props.report.report.reports.map(row => {
									return (
										<TableRow
										 	key={row._id}
											hover
											style={{cursor: 'pointer'}}
											onClick={e => this.download(row._id, e)} >
											<TableCell className={classes.noWrap}>
												{row.filename}
											</TableCell>
											<TableCell className={classes.noWrap}>
												{ cleanDate(row.created) }
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
          </DialogContent>
          <DialogActions>
						<Link to={process.env.API_URL + '/editReport/' + this.props.report.report._id} style={{textDecoration: 'none'}}>
            <Button onClick={this.props.fn.closeReport} color="primary">
              Edit
            </Button>
						</Link>
            <Button onClick={this.props.fn.closeReport} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
    );
  }
};

ViewSingleReport.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ViewSingleReport);
