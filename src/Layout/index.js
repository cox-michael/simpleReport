import React, {
  useState,
  useContext,
  Suspense,
  // lazy,
} from 'react';
// import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withRouter } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  AppBar,
  Button,
  IconButton,
  Toolbar,
  Typography,
  // Breadcrumbs,
  // Link,
  Tooltip,
} from '@material-ui/core';
import {
  // Assignment,
  MeetingRoom,
  Menu,
  Brightness3,
  Brightness7,
} from '@material-ui/icons';
import { SessionContext } from '../Session';
import MenuDrawer from './MenuDrawer';
import getMenuItems from './menuItems';
import { Row, Spinner } from '../components';
import ViewSingleReport from '../ViewSingleReport';
// import Transition from './Transition';

// const Branch = lazy(() => import('../Branch'));

const drawerWidth = 240;
const useStyles = makeStyles(theme => ({
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
    marginRight: 36,
  },
  hide: {
    display: 'none',
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
  marginTop: {
    marginTop: theme.spacing(1),
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginTop: theme.spacing(7),
  },
}));

const Layout = () => {
  const classes = useStyles();
  const theme = useTheme();
  const {
    setLoginState,
    // branches,
    loginState,
    darkMode,
    setDarkMode,
  } = useContext(SessionContext);
  // const context = useContext(SessionContext);
  // console.log({ context });
  const [open, setOpen] = useState(false);

  // const exclude = ['', 'br', 'projects', 'forms', 'editForm', 'reviews'];
  // const pathnames = pathname.split('/').filter(x => !exclude.includes(x));

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

  // const handleClick = (e, href) => {
  //   e.preventDefault();
  //   console.log({ e });
  //   push(href);
  // };

  // const branchMenuItems = branches.map(branch => ({
  //   // path: `${process.env.API_URL}br/:branchName/:itemType?/:itemName?`,
  //   to: `${process.env.API_URL}br/${branch.name}`,
  //   // to: `${process.env.API_URL}br/${branch.name}/forms/Liability`,
  //   name: branch.name,
  //   icon: Assignment,
  //   component: Branch,
  //   // hidden: true,
  //   // exact: false,
  // }));

  const menuItems = getMenuItems(loginState);
  // menuItems.splice(1, 0, ...branchMenuItems);

  // return <div>hello</div>;

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, { [classes.appBarShift]: open })}
      >
        {/* <Toolbar disableGutters={!open}> */}
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={toggleDrawer}
            edge="start"
            className={clsx(classes.menuButton, { [classes.hide]: open })}
          >
            <Menu />
          </IconButton>
          <Row justifyContent="space-between" alignItems="center" flexGrow={1}>
            <Typography variant="h6" noWrap>
              {process.env.TITLE}
            </Typography>

            <Row justifyContent="flex-end">
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
              <Button color="inherit" onClick={handleLogout} className={classes.marginTop}>
                <MeetingRoom className={classes.leftIcon} />
                Logout
              </Button>
            </Row>
          </Row>
        </Toolbar>


        {/* <Breadcrumbs className={classes.grow}>
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
            const to = pathname.substring(0, pathname.indexOf(value) + value.length);

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
        </Breadcrumbs> */}
        {/* </Toolbar> */}
      </AppBar>
      <MenuDrawer {...{
        open, toggleDrawer, menuItems, theme,
      }}
      />
      <main className={classes.content}>
        {/* <div className={classes.toolbar} /> */}
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
      <ViewSingleReport />
      { /* </Transition> */ }
    </div>
  );
};

// Layout.propTypes = {
//   // eslint-disable-next-line react/forbid-prop-types
//   // history: PropTypes.object.isRequired,
// };

export default withRouter(Layout);
