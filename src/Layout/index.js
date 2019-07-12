import React, {
  useState, useContext, Suspense, lazy,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withRouter } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import MenuIcon from '@material-ui/icons/Menu';
import {
  Assignment, MeetingRoom, Brightness3, Brightness7,
} from '@material-ui/icons';
import Button from '@material-ui/core/Button';
import Spinner from '@bit/ldsmike88.simplereport.spinner';
import { SessionContext } from '../Session';
import MenuDrawer from './MenuDrawer';
import getMenuItems from './menuItems';
// import Spinner from '../Spinner';
// import Transition from './Transition';

const Branch = lazy(() => import('../Branch'));

const drawerWidth = 240;
const styles = theme => ({
  root: {
    display: 'flex',
  },
  grow: {
    flexGrow: 1,
    color: 'inherit',
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
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(1) * 3,
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  displayName: {
    textAlign: 'right',
    padding: theme.spacing(1) * 2,
  },
  breadLink: {
    color: '#ffffffd9',
  },
  leftDiv: {
    display: 'inline-flex',
  },
});

const Layout = props => {
  const {
    setLoginState, branches, loginState, darkMode, setDarkMode,
  } = useContext(SessionContext);
  const { classes, theme, history: { location: { pathname }, push } } = props;
  const [open, setOpen] = useState(false);

  const exclude = ['', 'br', 'projects', 'forms', 'editForm', 'reviews'];
  const pathnames = pathname.split('/').filter(x => !exclude.includes(x));


  const toggleDrawer = () => setOpen(!open);

  const handleLogout = () => {
    fetch(`${process.env.API_URL}destroy`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(() => setLoginState({ ...loginState, isLoggedIn: false }));
  };

  const handleClick = (e, href) => {
    e.preventDefault();
    console.log({ e });
    push(href);
  };

  const branchMenuItems = branches.map(branch => ({
    // path: `${process.env.API_URL}br/:branchName/:itemType?/:itemName?`,
    to: `${process.env.API_URL}br/${branch.name}`,
    // to: `${process.env.API_URL}br/${branch.name}/forms/Liability`,
    name: branch.name,
    icon: Assignment,
    component: Branch,
    // hidden: true,
    // exact: false,
  }));

  const menuItems = getMenuItems(loginState);
  menuItems.splice(1, 0, ...branchMenuItems);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={classNames(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar disableGutters={!open}>
          <IconButton
            color="inherit"
            aria-label="Open drawer"
            onClick={toggleDrawer}
            className={classNames(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>

          <Breadcrumbs className={classes.grow}>
            { pathnames.length ? (
              <Link
                href="/"
                className={classes.breadLink}
                onClick={e => handleClick(e, '/')}
              >
                ReviewPoint
                {process.env.NODE_ENV !== 'production' && ` - ${process.env.NODE_ENV}`}
              </Link>
            ) : (
              <Typography variant="h6" color="inherit" noWrap>
                ReviewPoint
                {process.env.NODE_ENV !== 'production' && ` - ${process.env.NODE_ENV}`}
              </Typography>
            )}
            { pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = pathname
                .substring(0, pathname.indexOf(value) + value.length);

              const crumb = new Proxy({
                config: 'Configuration',
                userPermissions: 'User Permissions',
                superpower: 'Superpower',
                help: 'Help',
                // eslint-disable-next-line no-confusing-arrow
              }, { get: (target, name) => target[name] ? target[name] : name });

              return last ? (
                <Typography variant="h6" color="inherit" noWrap key={to}>
                  {crumb[value]}
                </Typography>
              ) : (
                <Link
                  className={classes.breadLink}
                  href={to}
                  key={to}
                  onClick={e => handleClick(e, to)}
                >
                  {crumb[value]}
                </Link>
              );
            })}
          </Breadcrumbs>
          <div className={classes.leftDiv}>
            <Tooltip title={`Turn ${darkMode ? 'off' : 'on'} dark mode`}>
              <IconButton onClick={() => setDarkMode(!darkMode)}>
                { darkMode ? <Brightness7 /> : <Brightness3 /> }
              </IconButton>
            </Tooltip>
            <Typography variant="subtitle2" color="inherit" noWrap>
              <div className={classes.displayName}>
                { loginState.displayName }
              </div>
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              <MeetingRoom className={classes.leftIcon} />
              Logout
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <MenuDrawer
        open={open}
        toggleDrawer={toggleDrawer}
        menuItems={menuItems}
        theme={theme}
      />
      { /* <Transition> */ }
      <main className={classes.content}>
        <div className={classes.toolbar} />
        { menuItems.filter(item => item.path).map(item => (
          <Suspense fallback={<Spinner centerScreen />} key={item.name}>
            <Switch>
              <Route
                exact={item.exact}
                path={item.path || item.to}
                component={item.component}
              />
            </Switch>
          </Suspense>
        ))}
      </main>
      { /* </Transition> */ }
    </div>
  );
};

Layout.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(withRouter(Layout));
