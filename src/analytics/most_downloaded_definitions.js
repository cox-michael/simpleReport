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
  center: {
    textAlign: 'center',
  },
});

class MostDownloadedDefinitions extends React.Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      definitions: []
    };
  }

  // handleClick = () => {
  //
  // }

  getDefinitions = () => {
    this.setState({
      loading: true,
    });
    fetch(process.env.API_URL + 'api/mostDownloadedDefinitions', {
      credentials: "same-origin"
    })
    .then(response => response.json())
    .then(res => {
      if (!res.isLoggedIn) {
        this.context.handleLoginStatusChange(false);
        return;
      } else if (res.messages[0] == 'You do not have permissions to do this') {
        window.location.href = process.env.API_URL + 'notPermitted';
      } else {
        this.setState({
          loading: false,
          definitions: res.data,
        })
      }
    });
  }

  componentDidMount() {
    this.getDefinitions();
  }

  render() {
    const classes = this.props.classes;
    const definitions = this.state.definitions

    return (
      <div>
        <Typography variant="h5" className={classes.center}>
          Report Definitions with the<br />Most Downloaded Files
        </Typography>
        <Typography variant="subtitle1" className={classes.center}>
          (Top 5)
        </Typography>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Definition Name</TableCell>
              <TableCell numeric>Downloads</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {definitions.map(definition => {
              return (
                <TableRow hover key={definition._id}>
                  <TableCell component="th">
                    {definition.name}
                  </TableCell>
                  <TableCell numeric>{definition.downloads}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
}

MostDownloadedDefinitions.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MostDownloadedDefinitions);
