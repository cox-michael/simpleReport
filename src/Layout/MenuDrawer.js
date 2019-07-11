import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import classNames from 'classnames';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';

const drawerWidth = 240;
const styles = theme => ({
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
    width: theme.spacing(1) * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(1) * 9,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
});

const MenuDrawer = props => {
  const {
    classes, open, toggleDrawer, menuItems, theme, history,
  } = props;

  return (
    <Drawer
      variant="temporary"
      classes={{
        paper: classNames(classes.drawerPaper, !open && classes.drawerPaperClose),
      }}
      open={open}
      onClick={toggleDrawer}
    >
      <div className={classes.toolbar}>
        <IconButton onClick={toggleDrawer}>
          {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </div>
      <Divider />
      <List>
        { menuItems.filter(item => item.to).map(item => {
          const MenuItemIcon = item.icon;
          return (
            <React.Fragment key={item.name}>
              { item.divider && <Divider /> }
              <ListItem button onClick={() => history.push(item.to)}>
                <ListItemIcon>
                  <MenuItemIcon />
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Drawer>
  );
};

MenuDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  menuItems: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

const MenuDrawerWithRouter = withRouter(MenuDrawer);

export default withStyles(styles)(MenuDrawerWithRouter);
