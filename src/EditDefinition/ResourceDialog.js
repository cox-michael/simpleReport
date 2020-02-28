import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Dialog,
  IconButton,
  Typography,
  Slide,
} from '@material-ui/core';
import {
  Close,
} from '@material-ui/icons';
import MaterialTable from 'material-table';
import { Row, Spinner } from '../components';
import { useFetch } from '../hooks';
import { DefDispatch } from './Context';

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  container: {
    marginTop: theme.spacing(1),
    height: 'calc(100% - 72px)',
  },
  connection: {
    minWidth: 150,
    margin: theme.spacing(1),
  },
}));

// eslint-disable-next-line react/display-name
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const ResourceDialog = props => {
  const classes = useStyles();

  const {
    dataSourceIndex,
    name,
    value,
    data,
    resourceDialogOpen,
    setResourceDialogOpen,
  } = props;

  const dispatch = useContext(DefDispatch);

  const [getResourceData, loading] = useFetch('getResourceData', results => {
    dispatch([{ dataSourceIndex }, { name: 'data', value: results }]);
  });

  useEffect(() => {
    if (!data.length) getResourceData({ _id: value });
  }, [data]);

  const cleanedData = data.map(row => {
    Object.entries(row).forEach(([key, v]) => {
      if (typeof v === 'boolean') row[key] = v ? 'true' : 'false';
    });
    return row;
  });

  const cellStyle = { padding: 2 };
  const columns = (cleanedData[0] ? Object.keys(cleanedData[0]) : []).map(c => (
    { title: c, field: c, cellStyle }
  ));

  return (
    <>
      <Dialog
        fullScreen
        open={resourceDialogOpen}
        onClose={() => setResourceDialogOpen(false)}
        TransitionComponent={Transition}
        disableEscapeKeyDown
      >
        <AppBar className={classes.appBar}>
          <Row justifyContent="flex-start" alignItems="center">
            <IconButton color="inherit" onClick={() => setResourceDialogOpen(false)}>
              <Close />
            </IconButton>
            <div>
              <Typography variant="h6">
                {name}
              </Typography>
            </div>
          </Row>
        </AppBar>
        <div className={classes.container}>
          {loading ? (
            <Spinner center centerScreen />
          ) : (
            <MaterialTable {...{
              title: `${data.length} rows`,
              columns,
              data: cleanedData,
              options: {
                paging: false,
                showTitle: !!data.length,
              },
            }}
            />
          )}
        </div>
      </Dialog>
    </>
  );
};

ResourceDialog.propTypes = {
  dataSourceIndex: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  resourceDialogOpen: PropTypes.bool.isRequired,
  setResourceDialogOpen: PropTypes.func.isRequired,
};

ResourceDialog.defaultProps = {
  data: [],
};

export default ResourceDialog;
