import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { TreeView, TreeItem } from '@material-ui/lab';
import {
  ChevronRight,
  ExpandMore,
} from '@material-ui/icons';
import { SessionContext } from '../Session';
import { Spinner } from '../components';

const useStyles = makeStyles(theme => ({
  treeContainer: {
    minWidth: 200,
    border: '1px solid darkgray',
    minHeight: '50vh',
    padding: theme.spacing(1),
  },
  noSelect: {
    userSelect: 'none',
  },
}));

let timer = 0;
const delay = 200;
let prevent = false;

const FolderTree = props => {
  const classes = useStyles();
  const { onSelect } = props;
  const { folders, getFolders, foldersLoading } = useContext(SessionContext);

  const [expanded, setExpanded] = useState(['undefined']);

  useEffect(() => {
    if (folders === null) getFolders();
  }, []);

  if (folders === null || foldersLoading) return <Spinner center />;

  const onClick = (e, _id) => {
    e.stopPropagation();
    timer = setTimeout(() => {
      if (!prevent) onSelect(_id, _id ? folders.find(f => f._id === _id).name : '/');
      prevent = false;
    }, delay);
  };

  const onDoubleClick = (e, _id) => {
    clearTimeout(timer);
    prevent = true;
    e.stopPropagation();

    const undef = 'undefined';
    onSelect(_id, _id ? folders.find(f => f._id === _id).name : '/');
    if (expanded.includes((_id || undef))) {
      setExpanded(expanded.filter(n => n !== (_id || undef)));
      return;
    }
    setExpanded([...expanded, (_id || undef)]);
  };

  const displayFolders = _id => (
    folders.filter(f => f.parentId === _id).map(f => (
      <TreeItem
        key={f._id}
        nodeId={f._id}
        label={f.name}
        onClick={e => onClick(e, f._id)}
        onDoubleClick={e => onDoubleClick(e, f._id)}
        className={classes.noSelect}
      >
        {displayFolders(f._id)}
      </TreeItem>
    ))
  );

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMore />}
      defaultExpandIcon={<ChevronRight />}
      expanded={expanded}
      className={`${classes.treeContainer} ${classes.noSelect}`}
    >
      <TreeItem
        nodeId="undefined"
        label="/"
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={classes.noSelect}
      >
        {displayFolders(undefined)}
      </TreeItem>
    </TreeView>
  );
};

FolderTree.propTypes = {
  onSelect: PropTypes.func,
};

FolderTree.defaultProps = {
  onSelect: () => {},
};

export default FolderTree;
