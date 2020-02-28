/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useContext } from 'react';
// import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  Add,
  ViewComfy,
  ArrowDownward,
  ArrowUpward,
  // Help,
  Delete,
  OpenInBrowser,
} from '@material-ui/icons';
import Column from '../Column';
import { Row, Spinner } from '../components';
import QueryDialog from './QueryDialog';
import ResourceDialog from './ResourceDialog';
import { SessionContext } from '../Session';
import { DefDispatch } from './Context';

const useStyles = makeStyles(theme => ({
  leftSmallIcon: {
    marginRight: theme.spacing(1),
    fontSize: 20,
  },
  formControl: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(2),
    minWidth: 100,
  },
  ordinal: {
    cursor: 'pointer',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(2),
    // minWidth: 60,
  },
  tooltipText: {
    fontSize: 16,
  },
  toolTipIcon: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  divider: {
    margin: theme.spacing(1, 0),
  },
  textField: {
    margin: theme.spacing(1, 1, 0, 0),
    width: 300,
  },
  type: {
    marginRight: theme.spacing(1),
    minWidth: 100,
  },
  resourceName: {
    margin: theme.spacing(1, 1, 0, 0),
    width: 300,
  },
  vdBtn: {
    minWidth: 122,
    whiteSpace: 'nowrap',
  },
}));

const EditDataSources = props => {
  const classes = useStyles();
  const { dataSources } = props;
  const {
    resources, getResources, resourcesLoading, connections, getConnections,
  } = useContext(SessionContext);
  const dispatch = useContext(DefDispatch);
  const reorder = (oldIndex, newIndex) => dispatch([{ reorder: 'dataSources' }, { oldIndex, newIndex }]);
  const [ordinalsOpen, setOrdinalsOpen] = useState(false);

  // const { connections } = useContext(SessionContext);

  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [dialogDsIndex, setDialogDsIndex] = useState(null);

  useEffect(() => {
    if (!connections.length) getConnections();
    if (resources === null) getResources();
  }, []);

  const addDataSource = () => {
    let id = new Date().valueOf();
    while (dataSources.map(ds => ds.id).includes(id)) id += 1;
    const newDataSource = {
      id,
      type: '',
      value: '',
      // database: '',
    };
    dispatch([{}, { name: 'dataSources', value: [...dataSources, newDataSource] }]);
  };

  const handleChange = ({ target }, dataSourceIndex) => {
    const { type, checked, name } = target;
    const value = type === 'checkbox' ? checked : target.value;
    dispatch([{ dataSourceIndex }, { name, value }]);
  };

  const removeDataSource = () => {
    dataSources.splice(dialogDsIndex, 1);
    dispatch([{}, { name: 'dataSources', value: [...dataSources] }]);
    setRemoveDialogOpen(false);
  };

  const ordinals = [...Array(dataSources.length).keys()];

  if (resourcesLoading || resources === null) return <Spinner center centerScreen />;

  return (
    <Column justifyContent="flex-start" alignItems="flex-start">
      {dataSources.map((ds, dsIndex) => (
        <Row key={dsIndex} justifyContent="space-between" alignItems="flex-end">
          <Row alignItems="flex-end">
            {(ordinalsOpen && dsIndex === dialogDsIndex) ? (
              <FormControl className={classes.ordinal}>
                <Select
                  value={dsIndex}
                  onChange={e => reorder(dsIndex, e.target.value)}
                  inputProps={{ name: 'ordinal' }}
                  open={ordinalsOpen && dsIndex === dialogDsIndex}
                  onClose={() => setOrdinalsOpen(false)}
                >
                  {ordinals.map(o => (
                    <MenuItem value={o} key={o}>{o + 1}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography
                variant="button"
                onClick={() => { setOrdinalsOpen(true); setDialogDsIndex(dsIndex); }}
                className={classes.ordinal}
              >
                {dsIndex + 1}
                .
              </Typography>
            )}
            {ds.type !== '' ? (
              <Typography variant="button" className={classes.type}>
                {ds.type}
              </Typography>
            ) : (
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="type">Type</InputLabel>
                <Select
                  value={ds.type}
                  onChange={e => handleChange(e, dsIndex)}
                  inputProps={{ name: 'type' }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="Resource">Resource</MenuItem>
                  <MenuItem value="Query">Query</MenuItem>
                </Select>
              </FormControl>
            )}
            {ds.type === 'Query' && (
              <>
                <TextField
                  label="Name"
                  name="name"
                  className={classes.textField}
                  value={ds.name}
                  onChange={e => handleChange(e, dsIndex)}
                  margin="normal"
                />
                {!!connections.find(c => c._id === ds.connectionId) && (
                  <Typography variant="button" className={classes.type}>
                    {connections.find(c => c._id === ds.connectionId).name}
                  </Typography>
                )}
              </>
            )}
            {ds.type === 'Resource' && (
              <FormControl className={classes.resourceName}>
                <InputLabel htmlFor="value">Resource Name</InputLabel>
                <Select
                  value={ds.value}
                  onChange={e => handleChange(e, dsIndex)}
                  inputProps={{ name: 'value' }}
                >
                  <MenuItem value=""><em>{resourcesLoading ? 'Loading...' : 'None'}</em></MenuItem>
                  {resources.map(r => (
                    <MenuItem value={r._id} key={r._id}>{r.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Row>
          <ButtonGroup color="primary" size="small">
            <Button
              disabled={dsIndex === 0}
              onClick={() => reorder(dsIndex, dsIndex - 1)}
            >
              <ArrowUpward />
            </Button>
            <Button
              disabled={dsIndex === dataSources.length - 1}
              onClick={() => reorder(dsIndex, dsIndex + 1)}
            >
              <ArrowDownward />
            </Button>
            {ds.type === 'Query' && (
              <Button
                onClick={() => { setQueryDialogOpen(true); setDialogDsIndex(dsIndex); }}
                className={classes.vdBtn}
              >
                <OpenInBrowser className={classes.leftSmallIcon} />
                Edit Query
              </Button>
            )}
            {ds.type === 'Resource' && (
              <Button
                onClick={() => { setResourceDialogOpen(true); setDialogDsIndex(dsIndex); }}
                className={classes.vdBtn}
              >
                <ViewComfy className={classes.leftSmallIcon} />
                View Data
              </Button>
            )}
            <Button
              onClick={() => { setDialogDsIndex(dsIndex); setRemoveDialogOpen(true); }}
            >
              <Delete />
            </Button>
          </ButtonGroup>
          {/* <FormControl className={classes.formControl}>
            <InputLabel htmlFor="database">Database</InputLabel>
            <Select
              value={ds.database}
              onChange={e => handleChange(e, dsIndex)}
              inputProps={{
                name: 'database',
                id: 'database',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              { databases.map(db => (
                <MenuItem key={db._id} value={db._id}>
                  { db.name }
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
        </Row>
      ))}
      <Divider className={classes.divider} />
      <Row>
        <Button color="primary" onClick={addDataSource}>
          <Add className={classes.leftSmallIcon} />
          Add Data Source
        </Button>
      </Row>

      {(queryDialogOpen && dialogDsIndex !== null) && (
        <QueryDialog {...{
          dataSourceIndex: dialogDsIndex,
          ...dataSources[dialogDsIndex],
          queryDialogOpen,
          setQueryDialogOpen,
        }}
        />
      )}

      {(resourceDialogOpen && dialogDsIndex !== null) && (
        <ResourceDialog {...{
          dataSourceIndex: dialogDsIndex,
          ...dataSources[dialogDsIndex],
          resourceDialogOpen,
          setResourceDialogOpen,
        }}
        />
      )}

      {(dialogDsIndex !== null && dataSources[dialogDsIndex]) && (
        <Dialog
          open={removeDialogOpen}
          onClose={() => setRemoveDialogOpen(false)}
        >
          <DialogTitle>{`Remove Data Source "${dataSources[dialogDsIndex].name}"?`}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to remove this data source?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRemoveDialogOpen(false)} color="default" autoFocus>
              No
            </Button>
            <Button onClick={removeDataSource} color="primary">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Column>
  );
};

EditDataSources.propTypes = {
  dataSources: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.string,
    database: PropTypes.string,
  })),
};

EditDataSources.defaultProps = {
  dataSources: [],
};

export default EditDataSources;
