import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
	button: {
		marginRight: theme.spacing.unit,
		marginBottom: theme.spacing.unit,
		marginLeft: theme.spacing.unit,
	},
	paper: {
		marginBottom: theme.spacing.unit * 4,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'left',
		padding: `${theme.spacing.unit * 4}px ${theme.spacing.unit * 6}px ${theme.spacing.unit * 6}px`,
		textAlign: 'center',
	},
});

class NotPermitted extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const classes = this.props.classes;

		return (
			<Paper className={classes.paper}>
				<Typography variant="h5">Oops. You are not permitted to do that.</Typography>
			</Paper>
		)
	}
}

NotPermitted.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NotPermitted);
