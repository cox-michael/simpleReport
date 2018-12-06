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
													<SvgIcon
														viewBox="0 0 384 512"
														onClick={e => this.download(row._id, e)}
													>
														<path fill="currentColor" d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm76.45 211.36l-96.42 95.7c-6.65 6.61-17.39 6.61-24.04 0l-96.42-95.7C73.42 337.29 80.54 320 94.82 320H160v-80c0-8.84 7.16-16 16-16h32c8.84 0 16 7.16 16 16v80h65.18c14.28 0 21.4 17.29 11.27 27.36zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z"></path>
													</SvgIcon>
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
													{download.user_id}
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
