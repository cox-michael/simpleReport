import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import SaveIcon from '@material-ui/icons/Save';
import classNames from 'classnames';
import TextField from '@material-ui/core/TextField';
import { Redirect } from 'react-router';
import { SessionContext, SessionProvider } from "./session";
import EditSheets from './edit_report/edit_sheets';
import EditSchedules from './edit_report/edit_schedules';
import EditPermissions from './edit_report/edit_permissions';
import { Description, Help, HelpOutline } from '@material-ui/icons';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
	layout: {
		width: 'auto',
		display: 'block', // Fix IE 11 issue.
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		[theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
			width: 750,
			marginLeft: 15,
			marginRight: 15,
		},
	},
	paper: {
		marginBottom: theme.spacing.unit * 4,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'left',
		padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing.unit,
	},
	submit: {
		marginTop: theme.spacing.unit * 3,
	},
	leftIcon: {
		marginRight: theme.spacing.unit,
	},
	iconSmall: {
		fontSize: 20,
	},
	toolTipIcon: {
		fontSize: 18,
		color: 'rgba(0, 0, 0, 0.5)',
	},
	tooltipText: {
		fontSize: 16,
	},
	button: {
		marginTop: theme.spacing.unit,
		marginLeft: theme.spacing.unit,
	},
  floating: {
    position: 'fixed',
    top: theme.spacing.unit * 11,
    right: theme.spacing.unit * 3,
		zIndex: 100,
  },
  progress: {
    // color: green[500],
    position: 'relative',
    top: -78, // 15 without <br />
    left: 43, // -60 without <br />
    zIndex: 10000,
  },
  progress2: {
    position: 'relative',
    top: -34, // 15 without <br />
    left: 43, // -60 without <br />
    zIndex: 10000,
  },
});

class EditReport extends React.Component {
	static contextType = SessionContext;
	constructor(props) {
		super(props);
		const loading = this.props.match.params.report_id ? true : false;

		this.state = {
			loading: loading,
			newReport: !loading,
			attempted: false,
			attempting: false,
			testing: false,
			saved: false,
			report: {
				name: '',
				description: '',
				dept: '',
				requestedBy: '',
				exceptionsReport: false,
				sheets: [{
					name: 'sheet1',
					description: '',
					printReportName: true,
					printSheetName: true,
					tables: []
				}],
				schedules: [],
				permissions: {
					company: {
						L4: false,
						L3: false,
						L2: false,
						L1: false,
					},
					dept: {
						L3: false,
						L2: false,
						L1: false,
					}
				},
			},
		};
	}

	updateChild = (child, obj) => {
		const report = this.state.report;
		report[child] = obj;
		this.setState({
			report: report,
		});
	}

	updateReport = ({target}) => {
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.updateChild(target.name, value);
	}
	updateSheets = (sheets) => this.updateChild('sheets', sheets);
	updateSchedules = (schedules) => this.updateChild('schedules', schedules);
	updatePermissions = (permissions) => this.updateChild('permissions', permissions);

	runTest = () => {
		this.setState({
		  testing: true,
		})

		fetch(process.env.API_URL + 'api/runTest', {
			method: 'POST',
			credentials: "same-origin",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				report: this.state.report,
			})
		})
			.then(response => response.json())
			.then(data => {

				let buf = Buffer.from(JSON.parse(data.buffer).data);
				let blob = new Blob([buf]);

				var url = window.URL.createObjectURL(blob);
				var a = document.createElement('a');
				a.href = url;
				a.download = "filename.xlsx";
				// we need to append the element to the dom
				// otherwise it will not work in firefox
				document.body.appendChild(a);
				a.click();
				a.remove();  // afterwards we remove the element again

				this.setState({
				  testing: false,
				})
				var snackMsg = data.success ? 'Report generated' : data.messages[0]
				var snackType = data.success ? 'success' : 'error'

				this.context.openSnack(snackMsg, snackType);
		})
	}

	handleSubmit = (openSnack, e) => {
		e.preventDefault();
		this.setState({
			attempted: true,
			attempting: true,
			pw: ''
		});

		var endpoint = this.state.newReport ? 'createNewReport' : 'updateReport';
		var report = this.state.report;
		if (!this.state.newReport) report._id = this.props.match.params.report_id;
		delete report.starred;
		delete report.subscribed;
		delete report.notify;

		fetch(process.env.API_URL + 'api/' + endpoint, {
			method: 'POST',
			credentials: "same-origin",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				report: report,
			})
		})
			.then(response => response.json())
			.then(data => {
				if (!data.isLoggedIn){
					this.context.handleLoginStatusChange(false);
					return;
				}
				var snackMsg = data.success ?
				  'Report saved successfully' :
				  'Failed to save report'
				var snackType = data.success ? 'success' : 'error'
				openSnack(snackMsg, snackType);
				this.setState({
					saved: data.success,
					attempting: false,
				});
			});
	}

	componentDidMount() {
		if (!this.state.newReport) {
			fetch(process.env.API_URL + 'api/returnDefinition', {
				method: 'POST',
				credentials: "same-origin",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					reportId: this.props.match.params.report_id
				})
			})
			.then(response => response.json())
			.then(response => {
				if (!response.isLoggedIn){
					this.context.handleLoginStatusChange(false);
					return;
				} else if (response.messages[0] == 'You do not have permissions to do this') {
					window.location.href = process.env.API_URL + 'notPermitted';
				}

				this.setState({
					loading: false,
					saved: false,
					tab: 0,
					report: response.data,
				})
			});
		}

		this.context.loadDatabases();
	}

	render() {
		if (this.state.saved){
			return <Redirect push to={process.env.API_URL} />;
		}

		const classes = this.props.classes;

		return (
			<React.Fragment>
				<CssBaseline />
				<div className={classes.floating}>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={this.state.attempting}
						className={classes.button}
						onClick={(e) => this.handleSubmit(this.context.openSnack, e)}
					>
						<SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
						Save
					</Button>
					<br/>
					<Button
						variant="contained"
						color="secondary"
						disabled={this.state.testing}
						className={classes.button}
						onClick={this.runTest}
					>
						<Description
						 	className={classNames(classes.leftIcon, classes.iconSmall)}
						/>
						Test
					</Button>
					<br/>
					{ this.state.attempting &&
							<CircularProgress size={30} className={classes.progress} />
					}
					{ this.state.testing &&
							<CircularProgress size={30} className={classes.progress2} />
					}
				</div>

				<Grid
				  container
				  direction="row"
				  justify="center"
				  alignItems="flex-start"
				>
					<div className={classes.layout}>
						<Paper className={classes.paper}> { /* Report Level */ }
							<Typography component="h1" variant="h5" align="center">
								{this.state.newReport ? 'New Report' : 'Edit Report'}
							</Typography>
							<form className={classes.form} onSubmit={ this.handleSubmit }>
								<FormControl margin="normal" required fullWidth>
									<InputLabel htmlFor="name">Report Name</InputLabel>
									<Input id="name" name="name"
									 	value={this.state.report.name}
										onChange={this.updateReport}
										autoFocus />
								</FormControl>
								<FormControl margin="normal" required fullWidth>
									<TextField id="description" name="description"
										label="Report Description"
										multiline rowsMax="9"
										value={this.state.report.description}
										onChange={this.updateReport}
									/>
								</FormControl>
								<br />
								<FormControl margin="normal" required fullWidth>
									<TextField id="dept" name="dept"
									 	label="Department (automatic once requester tied to AD)"
										value={this.state.report.dept}
										onChange={this.updateReport}
									/>
								</FormControl>
								<FormControl margin="normal" required fullWidth>
									<TextField id="requestedBy" name="requestedBy"
										label="Requested By"
										value={this.state.report.requestedBy}
										onChange={this.updateReport} />
								</FormControl>
								<Tooltip
								 	title={
										<span className={classes.tooltipText}>
											The report will only be saved & emailed if at least one of the queries returns data
										</span>
									}
									placement="right"
								>
									<FormControlLabel
										control={
											<Checkbox id="exceptionsReport" name="exceptionsReport"
												checked={this.state.report.exceptionsReport}
												color="primary"
												onChange={this.updateReport}/>
										}
										label={
											<span>
												Exceptions Report <Help className={classes.toolTipIcon} />
											</span>
										}
									/>
								</Tooltip>
							</form>
						</Paper>

						<Paper className={classes.paper}> { /* Schedules Level */ }
							<EditSchedules
							 	schedules={this.state.report.schedules}
								updateSchedules={this.updateSchedules} />
						</Paper>

						<Paper className={classes.paper}> { /* Permissions Level */ }
							<EditPermissions
							 	permissions={this.state.report.permissions}
								updatePermissions={this.updatePermissions} />
						</Paper>

					</div>

					<div className={classes.layout}>
						<Paper className={classes.paper}> { /* Sheets Level */ }
							<EditSheets
								sheets={this.state.report.sheets}
								updateSheets={this.updateSheets} />
						</Paper>
					</div>

				</Grid>
			</React.Fragment>
		);
	}
}

EditReport.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditReport);
