import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = theme => ({
  table: {
    width: 200,
		marginLeft: 'auto',
		marginRight: 'auto',
  },
});

class EditPermissions extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
		};
	}

	handleChange = ({ target }) => {
		const permissions = this.props.permissions
		console.log(target.name);
		const value = target.type === 'checkbox' ? target.checked : target.value;
		console.log(value);

		const [f, s] = target.name.split('.');
		permissions[f][s] = value;
		this.props.updatePermissions(permissions);
	}

	render() {
		const classes = this.props.classes;
		const perms = this.props.permissions;

		return (
				<main>
					<Typography component="h1" variant="h5" align="center">
						Permissions
					</Typography>
					<br/>
					<Table className={classes.table}>
		        <TableHead>
		          <TableRow>
		            <TableCell numeric></TableCell>
		            <TableCell numeric>Department</TableCell>
		            <TableCell numeric>Company</TableCell>
		          </TableRow>
		        </TableHead>
		        <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  Senior Management
                </TableCell>
                <TableCell numeric></TableCell>
                <TableCell numeric>
									<Checkbox
									 	name="company.L4"
										checked={perms.company.L4}
										color="primary"
										onChange={this.handleChange} />
								</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  President, VP, AVP
                </TableCell>
                <TableCell numeric>
									<Checkbox
									 	name="dept.L3"
										checked={perms.dept.L3}
										color="primary"
										onChange={this.handleChange} />
								</TableCell>
                <TableCell numeric>
									<Checkbox
									 	name="company.L3"
										checked={perms.company.L3}
										color="primary"
										onChange={this.handleChange} />
								</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  Manager, Supervisor, Coordinator
                </TableCell>
                <TableCell numeric>
									<Checkbox
									 	name="dept.L2"
										checked={perms.dept.L2}
										color="primary"
										onChange={this.handleChange} />
								</TableCell>
                <TableCell numeric>
									<Checkbox
									 	name="company.L2"
										checked={perms.company.L2}
										color="primary"
										onChange={this.handleChange} />
								</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  Everyone Else
                </TableCell>
                <TableCell numeric>
									<Checkbox
									 	name="dept.L1"
										checked={perms.dept.L1}
										color="primary"
										onChange={this.handleChange} />
								</TableCell>
                <TableCell numeric>
									<Checkbox
									 	name="company.L1"
										checked={perms.company.L1}
										color="primary"
										onChange={this.handleChange} />
								</TableCell>
              </TableRow>
		        </TableBody>
		      </Table>
				</main>
		);
	}
}

EditPermissions.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditPermissions);
