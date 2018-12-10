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
import SvgIcon from '@material-ui/core/SvgIcon';
import { GetApp } from '@material-ui/icons';
// import MyImageSvg from './../svg_icons/file-excel-solid.svg';

const styles = theme => ({
	table: {
		minWidth: 500,
	},
	description: {
		maxWidth: 500,
	},
	noWrap: {
		whiteSpace: 'nowrap',
	},
	centerText: {
		textAlign: "center"
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
		this.state = {
			downloadDetails: {
				report: {downloads: []},
				open: false,
			},
		}
	};

	download(reportId, {target}) {
		window.open("http://" + process.env.FULL_URL +
		 						"/downloadReport/" + reportId, "_self");
	}

	openDownloadDetails = (report, {target}) => {
		this.setState({
		  downloadDetails: {
				report: report,
				open: true,
			},
		})
	}

	closeDownloadDetails = () => {
		this.setState({
			downloadDetails: {
				report: {downloads: []},
				open: false,
			},
		})
	}

  render() {
		const classes = this.props.classes;
		const report = this.props.report.report;

    return (
        <Dialog
          open={this.props.report.open}
          onClose={this.props.fn.closeReport}
					scroll="paper"
          aria-labelledby="form-dialog-title"
					maxWidth={false}
        >
          <DialogTitle id="form-dialog-title">{report.name}</DialogTitle>
          <DialogContent>
            <DialogContentText className={classes.description}>
							{report.description}
						</DialogContentText>
						<Table className={classes.table}>
							<TableHead>
								<TableRow>
									<TableCell>Name</TableCell>
									<TableCell>Date Run</TableCell>
									{this.props.analyst && (
										<TableCell numeric>Downloads</TableCell>
									)}
								</TableRow>
							</TableHead>
							<TableBody>
								{report.reports.map(row => {
									return (
										<TableRow key={row._id} hover>
											<TableCell className={classes.noWrap}>
												<Button color="primary" mini>
													<GetApp onClick={e => this.download(row._id, e)} />
												</Button>
												{row.filename}
											</TableCell>
											<TableCell className={classes.noWrap}>
												{ cleanDate(row.created) }
											</TableCell>
											{this.props.analyst && (
												<TableCell className={classes.centerText}>
													{row.downloads.length ? (
															<Button variant='fab' color="primary" mini
																onClick={e => this.openDownloadDetails(row, e)}
															>
																{row.downloads.length}
															</Button>
														) : (
															row.downloads.length
													)}
												</TableCell>
											)}
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
          </DialogContent>
          <DialogActions>
						<Link
						 	to={process.env.API_URL + '/editReport/' + report._id}
							style={{textDecoration: 'none'}}>
						{ this.props.analyst &&
						<Button onClick={this.props.fn.closeReport} color="primary">
              Edit
            </Button>
						}
						</Link>
            <Button onClick={this.props.fn.closeReport} color="primary">
              Close
            </Button>
          </DialogActions>

	        <Dialog
	          open={this.state.downloadDetails.open}
	          onClose={this.closeDownloadDetails}
						scroll="paper"
						maxWidth={false}
	        >
	          <DialogTitle id="form-dialog-title">Downloads</DialogTitle>
						<DialogContent>
							<Table className={classes.table}>
								<TableHead>
									<TableRow>
										<TableCell>Name</TableCell>
										<TableCell>Download Date</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.state.downloadDetails.report.downloads.map(download => {
										return (
											<TableRow key={download.timestamp} hover>
												<TableCell className={classes.noWrap}>
													{download.user}
												</TableCell>
												<TableCell className={classes.noWrap}>
													{ cleanDate(download.timestamp) }
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</DialogContent>
					</Dialog>
        </Dialog>
    );
  }
};

ViewSingleReport.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ViewSingleReport);
