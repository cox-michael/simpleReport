import { lazy } from 'react';
import {
  // Assignment,
  // Home as HomeIcon,
  // HowToVote,
  Fingerprint,
  // People,
  // Settings,
  TableChart,
} from '@material-ui/icons';

const Superpower = lazy(() => import('../Superpower'));
// const UserPermissions = lazy(() => import('../UserPermissions'));
const NotPermitted = lazy(() => import('../NotPermitted'));
const Definitions = lazy(() => import('../Definitions'));
const EditDefinition = lazy(() => import('../EditDefinition'));
// const Home = lazy(() => import('../Home'));
// const Branch = lazy(() => import('../Branch'));
// const Configuration = lazy(() => import('../Configuration'));

const getMenuItems = loginState => {
  const menuItems = [
    {
      path: process.env.API_URL,
      to: process.env.API_URL,
      name: 'Reports',
      icon: TableChart,
      component: Definitions,
      exact: true,
    },
    {
      path: `${process.env.API_URL}editDefinition/:_id`,
      // to: `${process.env.API_URL}editDefinition/:_id`,
      name: 'EditDefinition',
      // icon: TableChart,
      component: EditDefinition,
      // exact: true,
    },
    {
    //   path: `${process.env.API_URL}br/:branchName/:itemType?/:itemName?/:reviewId?`,
    //   // to: `${process.env.API_URL}br/${branch.name}/forms/Liability`,
    //   name: 'branch.name',
    //   icon: Assignment,
    //   component: Branch,
    //   exact: false,
    // }, {
    //   path: `${process.env.API_URL}requests`,
    //   to: `${process.env.API_URL}requests`,
    //   name: 'Feature Request',
    //   icon: HowToVote,
    //   component: Requests,
    // }, {
      path: `${process.env.API_URL}notPermitted`,
      // to: `${process.env.API_URL}notPermitted`,
      name: 'Not Permitted',
      component: NotPermitted,
    },
  ];

  const perms = loginState.permissions;
  // if (perms.sitewide && perms.sitewide.includes('Create/Edit/Delete Branches')) {
  //   menuItems.push({
  //     path: `${process.env.API_URL}config`,
  //     to: `${process.env.API_URL}config`,
  //     name: 'Configuration',
  //     icon: Settings,
  //     component: Configuration,
  //     divider: true,
  //   });
  // }
  if (perms.sitewide && perms.sitewide.includes('Superpower')) {
    menuItems.push({
      path: `${process.env.API_URL}superpower`,
      to: `${process.env.API_URL}superpower`,
      name: 'Superpower',
      icon: Fingerprint,
      divider: true,
      component: Superpower,
    });
  }
  // if (perms.sitewide && perms.sitewide.includes('Edit User Permissions')) {
  //   menuItems.push({
  //     path: `${process.env.API_URL}userPermissions`,
  //     to: `${process.env.API_URL}userPermissions`,
  //     name: 'User Permissions',
  //     icon: People,
  //     divider: true,
  //     component: UserPermissions,
  //   });
  // }

  return menuItems;
};

export default getMenuItems;
