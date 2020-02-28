import React, { useState } from 'react';
import PropTypes from 'prop-types';
// import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  // DialogContentText,
  DialogActions,
} from '@material-ui/core';
import { useFetch } from '../hooks';
import { Spinner } from '../components';
import FolderTree from './FolderTree';

// const useStyles = makeStyles(theme => ({
//   margin: {
//     margin: theme.spacing(2, 0, 1),
//   },
// }));

const MoveDialog = props => {
  // const classes = useStyles();
  const {
    moveDialogOpen, setMoveDialogOpen, def: { _id: defId, name }, onMove,
  } = props;

  const [selected, setSelected] = useState('/');
  const [selectedId, setSelectedId] = useState();

  const moved = () => { setMoveDialogOpen(false); onMove(); };

  const [move, moving] = useFetch('moveDef', moved);

  return (
    <Dialog {...{ open: moveDialogOpen, onClose: () => setMoveDialogOpen(false), maxWidth: 'lg' }}>
      <DialogContent>
        <DialogTitle>
          {`Move ${name}`}
        </DialogTitle>
        {moving ?
          <Spinner center /> :
          <FolderTree onSelect={(_id, n) => { setSelectedId(_id); setSelected(n); }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setMoveDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={() => move({ defId, folderId: selectedId })} color="primary">
          {`Move to ${selected}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

MoveDialog.propTypes = {
  moveDialogOpen: PropTypes.bool.isRequired,
  setMoveDialogOpen: PropTypes.func.isRequired,
  def: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  onMove: PropTypes.func,
};

MoveDialog.defaultProps = {
  onMove: () => {},
};

export default MoveDialog;
