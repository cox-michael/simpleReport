import React, { Component } from 'react'
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TextField from '@material-ui/core/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Button from '@material-ui/core/Button';
import { Add } from '@material-ui/icons';
import classNames from 'classnames';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
	layout: {
		width: 'auto',
		display: 'block', // Fix IE 11 issue.
		marginLeft: theme.spacing.unit * 3,
		marginRight: theme.spacing.unit * 3,
		[theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
			width: 800,
			marginLeft: 'auto',
			marginRight: 'auto',
		},
	},
	textField: {
		marginLeft: theme.spacing.unit,
		marginRight: theme.spacing.unit,
		width: 200,
	},
	leftIcon: {
		marginRight: theme.spacing.unit,
	},
	iconSmall: {
		fontSize: 20,
	},
  formControl: {
    // margin: theme.spacing.unit,
    minWidth: 120,
  },
});

class EditTables extends React.Component {
	constructor(props) {
		super(props);
		// console.log(this.props);
		this.state = {
			loading: false,
			tables: [{
				name: 'table1',
				description: '',
				query: '',
				filters: true
			}],
		};
	}

	handleChange = (tablename, { target }) => {
		const tables = this.props.tables
		const value = target.type === 'checkbox' ? target.checked : target.value;
		tables.find(t => t.name == tablename)[target.name] = value;
		this.props.updateTables(tables);
	}

	handleNewTable = ({ target }) => {
		var i = 1;
		while (this.props.tables.some(table => table.name === ('table'+i))) {
			i += 1;
		}
		var new_tablename = 'table' + i
		const tables = [
			...this.props.tables,
			{name: new_tablename, description: '', database: '', query: '', filters: true},
		]
		this.props.updateTables(tables);
	}

	render() {
		const classes = this.props.classes;

		return (
				<main>
					<Typography variant="h6">
						Tables
					</Typography>
					{this.props.tables.map(table => (
						<ExpansionPanel key={table.name} defaultExpanded={table.name == 'table1'}>
							<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
								<Typography>{table.name}</Typography>
							</ExpansionPanelSummary>
							<ExpansionPanelDetails>
								<div>
								  <FormControl margin="normal" required fullWidth>
										<TextField id="name" label="Table Name" name="name"
											 autoFocus
											 value={this.props.tables.find(t => t.name == table.name).name}
											 onChange={(e) => this.handleChange(table.name, e)} />
									</FormControl>
									<FormControl margin="normal" fullWidth>
										<TextField id="description" label="Table Description" name="description"
											 multiline rowsMax="9"
											 value={this.props.tables.find(t => t.name == table.name).description}
											 onChange={(e) => this.handleChange(table.name, e)} />
									</FormControl>
									 <FormControlLabel
					          control={
					            <Checkbox checked={this.props.tables.find(t => t.name == table.name).filters} color="primary" id="filters" name="filters"
												onChange={(e) => this.handleChange(table.name, e)}/>
					          }
					          label="Show filter buttons"
					        />
									<br />
									<FormControl className={classes.formControl}>
										<InputLabel htmlFor="database-simple">Database</InputLabel>
										<Select
											value={this.props.tables.find(t => t.name == table.name).database}
											onChange={(e) => this.handleChange(table.name, e)}
											inputProps={{
												name: 'database',
												id: 'database-simple',
											}}
										>
											<MenuItem value="">
												<em>None</em>
											</MenuItem>
											<MenuItem value="citadel">Citadel</MenuItem>
											<MenuItem value="innovation">Innovation</MenuItem>
											<MenuItem value="reviewpoint">ReviewPoint</MenuItem>
											<MenuItem value="rpa">RPA</MenuItem>
											<MenuItem value="rpm">RPM</MenuItem>
											<MenuItem value="uip">UiPath</MenuItem>
											<MenuItem value="vertica">Vertica</MenuItem>
										</Select>
									</FormControl>
									<FormControl margin="normal" fullWidth>
										<TextField id="query" label="Query" name="query"
											 multiline
											 value={this.props.tables.find(t => t.name == table.name).query}
											 onChange={(e) => this.handleChange(table.name, e)} />
									</FormControl>
							</div>
						</ExpansionPanelDetails>
						</ExpansionPanel>
					))}

					<Button color="primary" onClick={this.handleNewTable}>
						<Add className={classNames(classes.leftIcon, classes.iconSmall)} />
						New Table
					</Button>
				</main>
		);
	}
}

EditTables.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditTables);
