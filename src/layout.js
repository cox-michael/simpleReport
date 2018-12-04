import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import StarIcon from '@material-ui/icons/Star';
import { TableChart, AccessTime, HowToVote, LooksOne, Notifications,
 				 Fingerprint, Transform, MergeType,
         InsertChart } from '@material-ui/icons';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Definitions from './definitions';
import Schedules from './schedules';
import Superpower from './superpower';
import NotPermitted from './not_permitted';
import ButtonExample from './button_example';
import EditReport from './edit_report';
import Download from './download';
import Requests from './requests';
import Button from '@material-ui/core/Button';
import { MeetingRoom } from '@material-ui/icons';
import { SessionContext } from "./session";

const drawerWidth = 240;
const styles = theme => ({
	root: {
		display: 'flex',
		// flexGrow: 1,
	},
  grow: {
    flexGrow: 1,
  },
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
	},
	appBarShift: {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
	menuButton: {
		marginLeft: 12,
		marginRight: 36,
	},
	hide: {
		display: 'none',
	},
	drawerPaper: {
		position: 'sticky',
		whiteSpace: 'nowrap',
		width: drawerWidth,
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
	drawerPaperClose: {
		overflowX: 'hidden',
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		width: theme.spacing.unit * 7,
		[theme.breakpoints.up('sm')]: {
			width: theme.spacing.unit * 9,
		},
	},
	toolbar: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		padding: '0 8px',
		...theme.mixins.toolbar,
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing.unit * 3,
	},
	leftIcon: {
		marginRight: theme.spacing.unit,
	},
	iconSmall: {
		fontSize: 20,
	},
	displayName: {
		textAlign: "right",
		paddingRight: theme.spacing.unit * 2,
	},
});

class Layout extends React.Component {
  static contextType = SessionContext;
	constructor(props) {
		super(props);
		this.state = {
			open: false
		}
	};

	handleDrawerOpen = () => {
		this.setState({ open: true });
	};

	handleDrawerClose = () => {
		this.setState({ open: false });
	};

	handleLogout = () => {
		fetch(process.env.API_URL + '/destroy', {
			method: 'GET',
			credentials: "same-origin",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		}).then(() => this.context.handleLoginStatusChange(false));
	};

	render() {
		const { classes, theme } = this.props;
		return (
				<div className={classes.root}>
					<CssBaseline />
					<AppBar
						position="fixed"
						className={classNames(classes.appBar, {
							[classes.appBarShift]: this.state.open,
						})}
					>
						<Toolbar disableGutters={!this.state.open}>
							<IconButton
								color="inherit"
								aria-label="Open drawer"
								onClick={this.handleDrawerOpen}
								className={classNames(classes.menuButton, {
									[classes.hide]: this.state.open,
								})}
							>
								<MenuIcon />
							</IconButton>
							<Typography
                variant="h6"
                color="inherit"
                noWrap
                className={classes.grow}>
								simpleReport {process.env.NODE_ENV != 'production' && (" - " + process.env.NODE_ENV)}
							</Typography>
              <div>
  							<Typography variant="subtitle2" color="inherit" noWrap>
                  <div className={classes.displayName}>
                    { this.context.loginState.displayName }
                  </div>
  							</Typography>
  							<Button color="inherit" onClick={this.handleLogout}>
  								<MeetingRoom className={classNames(classes.leftIcon)} />
  								Logout
  							</Button>
              </div>
						</Toolbar>
					</AppBar>
					<Drawer
						variant="permanent"
						classes={{
							paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
						}}
						open={this.state.open}
					>
						<div className={classes.toolbar}>
							<IconButton onClick={this.handleDrawerClose}>
								{theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
							</IconButton>
						</div>
						<Divider />
						<List>
							<Link to={process.env.API_URL + "/"}>
								<ListItem button key="Reports"><ListItemIcon><TableChart /></ListItemIcon><ListItemText primary="Reports" /></ListItem>
							</Link>
							<Link to={process.env.API_URL + "/starred"}>
								<ListItem button key="Starred"><ListItemIcon><StarIcon /></ListItemIcon><ListItemText primary="Starred" /></ListItem>
							</Link>
							<Link to={process.env.API_URL + "/subscribed"}>
								<ListItem button key="Subscribed"><ListItemIcon><Notifications /></ListItemIcon><ListItemText primary="Subscribed" /></ListItem>
							</Link>
							<Divider />
              { /*
							<Link to={process.env.API_URL + "/adhoc"}>
								<ListItem button key="Ad-Hoc"><ListItemIcon><LooksOne /></ListItemIcon><ListItemText primary="Ad-Hoc" /></ListItem>
							</Link>
              */ }
							<Link to={process.env.API_URL + "/schedules"}>
								<ListItem button key="Schedules"><ListItemIcon><AccessTime /></ListItemIcon><ListItemText primary="Schedules" /></ListItem>
							</Link>
						</List>
						<Divider />
						<List>
							<Link to={process.env.API_URL + "/requests"}>
								<ListItem button key="Feature Request"><ListItemIcon><HowToVote /></ListItemIcon><ListItemText primary="Feature Request" /></ListItem>
							</Link>
						</List>
            { this.context.loginState.superpower &&
						<List>
							<Link to={process.env.API_URL + "/superpower"}>
								<ListItem button key="Superpower"><ListItemIcon><Fingerprint /></ListItemIcon><ListItemText primary="Superpower" /></ListItem>
							</Link>
						</List>
            }
            { /*
						<List>
							<Link to={process.env.API_URL + "/button"}>
								<ListItem button key="Data Sources"><ListItemIcon><Transform /></ListItemIcon><ListItemText primary="Data Sources" /></ListItem>
							</Link>
						</List>
            */ }
            { /*
						<List>
							<Link to={process.env.API_URL + "/button"}>
								<ListItem button key="Data Sources 2"><ListItemIcon><MergeType /></ListItemIcon><ListItemText primary="Data Sources 2" /></ListItem>
							</Link>
						</List>
            */ }
            { /*
						<List>
							<Link to={process.env.API_URL + "/button"}>
								<ListItem button key="Site Analytics"><ListItemIcon><InsertChart /></ListItemIcon><ListItemText primary="Site Analytics" /></ListItem>
							</Link>
						</List>
            */ }
					</Drawer>
					<main className={classes.content}>
						<div className={classes.toolbar} />
						<Route
              exact path={process.env.API_URL}
              render={ () => <Definitions filter="none" /> } />
						<Route
              path={process.env.API_URL + "/starred"}
              render={ () => <Definitions filter="starred" /> } />
						<Route
              path={process.env.API_URL + "/subscribed"}
              render={ () => <Definitions filter="subscribed" /> } />
						<Route
              path={process.env.API_URL + "/definition/:definition_id"}
              component={Definitions} />
						<Route
              path={process.env.API_URL + "/schedules"}
              render={ () => <Schedules filter="subscribed" /> } />
						<Route
              path={process.env.API_URL + "/requests"}
              component={Requests} />
						<Route
              path={process.env.API_URL + "/createNewReport"}
              component={EditReport} />
						<Route
              path={process.env.API_URL + "/editReport/:report_id"}
              component={EditReport} />
						<Route
              path={process.env.API_URL + "/download/:report_id"}
              component={Download} />
						<Route
              path={process.env.API_URL + "/notPermitted"}
              component={NotPermitted} />
						<Route
              path={process.env.API_URL + "/superpower"}
              component={Superpower} />
					</main>
				</div>
		);
	}
}

Layout.propTypes = {
	classes: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Layout);
