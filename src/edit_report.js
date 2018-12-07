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
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Delete, ArrowBack, ArrowForward } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import { Redirect } from 'react-router';
import { SessionContext, SessionProvider } from "./session";
import EditTables from './edit_report/edit_tables';
import EditSchedules from './edit_report/edit_schedules';
import EditPermissions from './edit_report/edit_permissions';
import { Description } from '@material-ui/icons';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
	layout: {
		width: 'auto',
		display: 'block', // Fix IE 11 issue.
		marginLeft: theme.spacing.unit * 3,
		marginRight: theme.spacing.unit * 3,
		[theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
			width: 800,
			marginLeft: 'auto',
			marginRight: 'auto',
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
	buttons: {
		display: 'flex',
		justifyContent: 'flex-end',
	},
	button: {
		marginTop: theme.spacing.unit,
		marginLeft: theme.spacing.unit,
	},
  floating: {
    position: 'fixed',
    top: theme.spacing.unit * 11,
    right: theme.spacing.unit * 3,
  },
  progress: {
    // color: green[500],
    position: 'relative',
    top: -78, // 15 without <br />
    left: 43, // -60 without <br />
    zIndex: 10000,
  },
  progress2: {
    // color: green[500],
    position: 'relative',
    top: -34, // 15 without <br />
    left: 43, // -60 without <br />
    zIndex: 10000,
  },
});

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
	      {props.children}
    </Typography>
	  );
}

TabContainer.propTypes = {
	  children: PropTypes.node.isRequired,
};

class EditReport extends React.Component {
	static contextType = SessionContext;
	constructor(props) {
		super(props);
		if (this.props.match.params.report_id) {
			var loading = true;
		} else {
			var loading = false;
		}

		this.state = {
			loading: loading,
			newReport: !loading,
			attempted: false,
			attempting: false,
			testing: false,
			username: "",
			password: "",
			data: [],
			saved: false,
			rname: '',
			rdesc: '',
			rprint: true,
			sprint: true,
			dept: '',
			requestedBy: '',
			tab: 0,
			sheets: [
				{name: 'sheet1', description: '', tables: []},
				{name: '+'},
			],
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
			}
		};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleTabChange = this.handleTabChange.bind(this);
		this.removeSheet = this.removeSheet.bind(this);
		this.moveSheet = this.moveSheet.bind(this);
		this.handleSheetChange = this.handleSheetChange.bind(this);
		this.updateTables = this.updateTables.bind(this);
		this.updateSchedules = this.updateSchedules.bind(this);
		this.updatePermissions = this.updatePermissions.bind(this);
	}

	handleChange({ target }) {
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({
			[target.name]: value
		});
	}

	handleSheetChange(index, { target }) {
		const sheets = this.state.sheets;
		sheets[index][target.name.substr(1)] = target.value;
		this.setState({
			sheets: sheets
		});
	}

	updateTables(tables) {
		const sheets = this.state.sheets;
		sheets[this.state.tab].tables = tables;
		this.setState({
			sheets: sheets,
		});
	}

	updateSchedules(schedules) {
		this.setState({
			schedules: schedules,
		});
	}

	updatePermissions(permissions) {
		this.setState({
			permissions: permissions,
		});
	}

	handleTabChange = (event, value) => {
		this.setState({
			tab: value
		});
		if (value == (this.state.sheets.length - 1)) {
			var i = 1;
			while (this.state.sheets.some(sheet => sheet.name === ('sheet'+i))) {
				i += 1;
			}
			var new_sheetname = 'sheet' + i
			this.setState({
			  sheets: [...this.state.sheets.slice(0, -1),
					{'name': new_sheetname, description: '', tables: []},
					{'name': '+'}
				]
			})
		}
	}

	removeSheet(sheetIndex, { target }) {
		var tab = this.state.tab;
		const sheets = this.state.sheets;
		if (tab == (sheets.length - 2)) {
			tab -= 1;
		}
		sheets.splice(this.state.tab, 1);
		this.setState({
			sheets: sheets,
			tab: tab
		})
	}

	moveSheet(direction, sheetIndex, { target }) {
		var move = direction == 'left' ? -1 : 1;
		const sheets = this.state.sheets;
		sheets.splice(sheetIndex + move, 0, sheets.splice(sheetIndex, 1)[0]);
		this.setState({
			sheets: sheets,
			tab: sheetIndex + move
		})
	}

	runTest = () => {
		this.setState({
		  testing: true,
		})
		var report = {
						name: this.state.rname,
						description: this.state.rdesc,
						print_report_name_on_every_sheet: this.state.rprint,
						print_sheet_name: this.state.sprint,
						dept: this.state.dept,
						requested_by: this.state.requestedBy,
						sheets: this.state.sheets.slice(0, -1),
						schedules: this.state.schedules,
						permissions: this.state.permissions,
				}

		fetch(process.env.API_URL + '/runTest', {
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
			this.setState({
			  testing: false,
			})
			var snackMsg = data.success ? 'Report generated' : data.messages[0]
			var snackType = data.success ? 'success' : 'error'

			this.context.openSnack(snackMsg, snackType);

			if (data.success) {
				window.open(data.url, "_self");
			}
			// if (!data.isLoggedIn){
			// 	this.context.handleLoginStatusChange(false);
			// 	return;
			// }
		});
	}

	handleSubmit(openSnack, e) {
		e.preventDefault();
		this.setState({
			attempted: true,
			attempting: true,
			pw: ''
		});

		var endpoint = this.state.newReport ? 'create_new_report' : 'update_report';
		var report = {
						name: this.state.rname,
						description: this.state.rdesc,
						print_report_name_on_every_sheet: this.state.rprint,
						print_sheet_name: this.state.sprint,
						dept: this.state.dept,
						requested_by: this.state.requestedBy,
						sheets: this.state.sheets.slice(0, -1),
						schedules: this.state.schedules,
						permissions: this.state.permissions,
				}
		if (!this.state.newReport) report._id = this.props.match.params.report_id;

		fetch(process.env.API_URL + '/' + endpoint, {
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
				var snackMsg = data.success ? 'Report saved successfully' : 'Failed to save report'
				var snackType = data.success ? 'success' : 'error'
				openSnack(snackMsg, snackType);
				this.setState({
					saved: data.success,
					attempting: false,
				});
			});
	}

	componentDidMount() {
		if (!this.state.newReport){
			fetch(process.env.API_URL + '/returnDefinition', {
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
			.then(data => {
				if (!data.isLoggedIn){
					this.context.handleLoginStatusChange(false);
					return;
				} else if (data.messages[0] == 'You do not have permissions to do this') {
					window.location.href = process.env.API_URL + '/notPermitted';
				}

				this.setState({
					loading: false,
					saved: false,
					tab: 0,
					rname: data.report.name,
					rdesc: data.report.description,
					rprint: data.report.print_report_name_on_every_sheet,
					sprint: data.report.print_sheet_name,
					dept: data.report.dept,
					requestedBy: data.report.requested_by,
					sheets: [...data.report.sheets,
						{'name': '+'},
					],
					// sheets: data.report.sheets,
					schedules: data.report.schedules,
					permissions: data.report.permissions,
				})
			});
		}
	}

	render() {
		if (this.state.saved){
			return <Redirect push to={process.env.API_URL} />;
		}

		const classes = this.props.classes;

		return (
			<React.Fragment>
				<CssBaseline />
				<main className={classes.layout}>
					<Paper className={classes.paper}>


						<Typography component="h1" variant="h5" align="center">
							New Report
						</Typography>
						<form className={classes.form} onSubmit={ this.handleSubmit }>
							<FormControl margin="normal" required fullWidth>
								<InputLabel htmlFor="rname">Report Name</InputLabel>
								<Input id="rname" name="rname" value={this.state.rname} onChange={this.handleChange} autoFocus />
							</FormControl>
							<FormControl margin="normal" required fullWidth>
								<TextField
									id="rdesc"
									label="Report Description"
									multiline
									rowsMax="9"
									name="rdesc"
									value={this.state.rdesc}
									onChange={this.handleChange} />
							</FormControl>
							<br />
							<FormControlLabel
			          control={
			            <Checkbox checked={this.state.rprint} color="primary" id="rprint" name="rprint" onChange={this.handleChange}/>
			          }
			          label="Print report name on every sheet"
			        />
							<br />
							<FormControlLabel
			          control={
			            <Checkbox checked={this.state.sprint} color="primary" id="sprint" name="sprint" onChange={this.handleChange}/>
			          }
			          label="Print sheet name on report"
			        />
							<FormControl margin="normal" required fullWidth>
								<TextField id="dept" label="Department (automatic once requester tied to AD)" name="dept"
										value={this.state.dept}
										onChange={this.handleChange} />
							</FormControl>
							<FormControl margin="normal" required fullWidth>
								<TextField id="requestedBy" label="Requested By" name="requestedBy"
										value={this.state.requestedBy}
										onChange={this.handleChange} />
							</FormControl>
						</form>
						<hr/>
					</Paper>


					<Paper className={classes.paper}>
						<Typography component="h1" variant="h5" align="center">
							Sheets
						</Typography>
						<Tabs value={this.state.tab} onChange={this.handleTabChange} scrollable>
							{this.state.sheets.map(sheet => (
								<Tab label={sheet.name} key={sheet.name} style={{textTransform: 'none'}} />
							))}
						</Tabs>
						<TabContainer>
							<Grid container direction="row" justify="space-between" alignItems="center">
								<Grid item>
								 {this.state.tab != 0 &&
									<Button variant="outlined" color="primary" onClick={(e) => this.moveSheet('left', this.state.tab, e)}>
										<ArrowBack className={classNames(classes.iconSmall)} />
									</Button>
								 }
								</Grid>
								<Grid item>
								 {this.state.sheets.length > 2 &&
									<Button variant="outlined" color="primary" onClick={(e) => this.removeSheet(this.state.tab, e)}>
										<Delete className={classNames(classes.iconSmall)} />
									</Button>
								 }
								</Grid>
								<Grid item>
								 {this.state.sheets.length - 2 != this.state.tab &&
									<Button variant="outlined" color="primary" onClick={(e) => this.moveSheet('right', this.state.tab, e)}>
										<ArrowForward className={classNames(classes.iconSmall)} />
									</Button>
								 }
								</Grid>
							</Grid>
							<FormControl margin="normal" required fullWidth>
								<TextField id="sname" label="Sheet Name" name="sname"
										value={this.state.sheets[this.state.tab].name}
										onChange={(e) => this.handleSheetChange(this.state.tab, e)} />
							</FormControl>
							<FormControl margin="normal" required fullWidth>
								<TextField id="sdescription" label="Sheet Description" name="sdescription"
									 multiline rowsMax="9"
									 value={this.state.sheets[this.state.tab].description}
									 onChange={(e) => this.handleSheetChange(this.state.tab, e)} />
							</FormControl>
							<br/><br/>

							<div>
								<EditTables tables={this.state.sheets[this.state.tab].tables} updateTables={this.updateTables} />
							</div>
						</TabContainer>
						{ /*this.state.tab === 0 && <TabContainer>Item One</TabContainer> */}
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
							<Description className={classNames(classes.leftIcon, classes.iconSmall)} />
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
					</Paper>


					<Paper className={classes.paper}>
						<EditSchedules schedules={this.state.schedules} updateSchedules={this.updateSchedules} />
					</Paper>


					<Paper className={classes.paper}>
						<EditPermissions permissions={this.state.permissions} updatePermissions={this.updatePermissions} />
					</Paper>

				</main>
			</React.Fragment>
		);
	}
}

EditReport.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditReport);
