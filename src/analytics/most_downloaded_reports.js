import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { SessionContext } from "./../session";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  table: {
    minWidth: 200,
  },
});

class MostDownloadedReports extends React.Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      reports: []
    };
  }

  // handleClick = () => {
  //
  // }

  getReports = () => {
    this.setState({
      loading: true,
    });
    fetch(process.env.API_URL + '/mostDownloadedReports', {
      credentials: "same-origin"
    })
    .then(response => response.json())
    .then(data => {
      if (!data.isLoggedIn) {
        this.context.handleLoginStatusChange(false);
        return;
      } else if (data.messages[0] == 'You do not have permissions to do this') {
        window.location.href = process.env.API_URL + '/notPermitted';
      } else {
        this.setState({
          loading: false,
          reports: data.reports,
        })
      }
    });
  }

  componentDidMount() {
    this.getReports();
  }

  render() {
    const classes = this.props.classes;
    const reports = this.state.reports

    return (
      <div>
        <Typography variant="h5">
          Most Downloaded Reports
        </Typography>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Report Name</TableCell>
              <TableCell numeric>Downloads</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map(report => {
              return (
                <TableRow hover key={report._id}>
                  <TableCell component="th">
                    {report.filename}
                  </TableCell>
                  <TableCell numeric>{report.downloads}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
}

MostDownloadedReports.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MostDownloadedReports);
