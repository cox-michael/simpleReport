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

class MostActiveUsersByDownloads extends React.Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      users: []
    };
  }

  // handleClick = () => {
  //
  // }

  getUsers = () => {
    this.setState({
      loading: true,
    });
    fetch(process.env.API_URL + '/mostActiveUsersByDownloads', {
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
          users: data.users,
        })
      }
    });
  }

  componentDidMount() {
    this.getUsers();
  }

  render() {
    const classes = this.props.classes;
    const users = this.state.users

    return (
      <div>
        <Typography variant="h5">
          Most Active Users by Downloads
        </Typography>
        <Table className={classes.table}>
          <TableHead>
            <TableRow hover>
              <TableCell>user Name</TableCell>
              <TableCell numeric>Downloads</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => {
              return (
                <TableRow key={user._id}>
                  <TableCell component="th">
                    {user.displayName}
                  </TableCell>
                  <TableCell numeric>{user.downloads}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
}

MostActiveUsersByDownloads.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MostActiveUsersByDownloads);
