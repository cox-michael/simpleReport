import React, { useState, useEffect, useContext } from 'react';
// import React from 'react';
// import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import { SessionContext } from './Session';
import { useFetch } from './hooks';
import { Spinner } from './components';

const useStyles = makeStyles(() => ({
  table: {
    minWidth: 500,
  },
  description: {
    maxWidth: 500,
  },
  noWrap: {
    whiteSpace: 'nowrap',
  },
  centerText: {
    textAlign: 'center',
  },
}));


const cleanDate = mongoDate => {
  const format = { hour: '2-digit', minute: '2-digit' };
  let date = new Date(mongoDate);
  date = date.toLocaleDateString([], format);
  return date.replace(',', ' at');
};

const ViewSingleReport = () => {
  const classes = useStyles();
  const { defReports, closeDefReports } = useContext(SessionContext);

  // const [downloads, setDownloads] = useState([]);
  // const [selectedId, setSelectedId] = useState(null);
  const [reports, setReports] = useState([]);
  const [getReports, reportsLoading] = useFetch('getDefReports', setReports);

  const { _id, name, description } = defReports;

  useEffect(() => {
    if (_id) getReports({ definitionId: _id });
  }, [defReports]);

  const download = reportId => {
    window.open(`http://${process.env.FULL_URL}/downloadReport/${reportId}`, '_self');
  };

  return (
    <Dialog
      open={!!_id}
      onClose={closeDefReports}
      scroll="paper"
      maxWidth={false}
    >
      <DialogTitle id="form-dialog-title">{name}</DialogTitle>
      <DialogContent>
        <DialogContentText className={classes.description}>
          {description}
        </DialogContentText>
        {reportsLoading ? (
          <Spinner center message="Loading Reports" />
        ) : (
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Name</TableCell>
                <TableCell>Date Run</TableCell>
                {/* {analyst && <TableCell numeric>Downloads</TableCell>} */}
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map(row => (
                <TableRow key={row._id} hover>
                  <TableCell className={classes.noWrap}>
                    {!row.noExceptions && (
                      <IconButton color="primary">
                        <GetApp onClick={() => download(row._id)} />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell className={classes.noWrap}>
                    {row.noExceptions ? (
                      <Typography>No exceptions to report</Typography>
                    ) : row.filename}
                  </TableCell>
                  <TableCell className={classes.noWrap}>
                    {cleanDate(row.created)}
                  </TableCell>
                  {/* {analyst && (
                    <TableCell className={classes.centerText}>
                      {row.downloads.length ? (
                        <Button
                          variant="fab"
                          color="primary"
                          mini
                          onClick={() => { setSelectedId(row._id); }}
                        >
                          {row.downloads.length}
                        </Button>
                      ) : (
                        row.downloads.length
                      )}
                    </TableCell>
                  )} */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDefReports} color="primary">
          Close
        </Button>
      </DialogActions>

      {/* <Dialog
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        scroll="paper"
        maxWidth={false}
      >
        <DialogTitle>Downloads</DialogTitle>
        <DialogContent>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Download Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {downloadDetails.report.downloads.map(dnld => (
                <TableRow key={dnld.timestamp} hover>
                  <TableCell className={classes.noWrap}>
                    {dnld.user}
                  </TableCell>
                  <TableCell className={classes.noWrap}>
                    {cleanDate(dnld.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog> */}
    </Dialog>
  );
};

// ViewSingleReport.propTypes = {
//   report: PropTypes.shape({
//     _id: PropTypes.string.isRequired,
//     name: PropTypes.string.isRequired,
//     description: PropTypes.string,
//   }).isRequired,
// };

export default ViewSingleReport;
