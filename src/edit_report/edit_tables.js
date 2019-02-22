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
import { Add, ColorLens } from '@material-ui/icons';
import classNames from 'classnames';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import EditDataSources from './edit_data_sources';
import RowBandingDialog from './row_banding_dialog.js';
import TotalsRowDialog from './totals_row_dialog.js';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import { Delete, ArrowUpward, ArrowDownward } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
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
			rowBanding: {
				open: false,
				reference: '',
				colors: {
					useDefaults: true,
					background: ['#FFFFFF', '#FFFFFF'],
					font: ['#000000', '#000000'],
				},
				tableIndex: 0,
			},
			totals: {
				open: false,
				reference: '',
				columns: {},
				tableIndex: 0,
			},
		};
	}

	handleNewTable = ({ target }) => {
		var i = 1;
		while (this.props.tables.some(table => table.name === ('table'+i))) {
			i += 1;
		}
		var new_tablename = 'table' + i
		const tables = [
			...this.props.tables,
			{
				name: new_tablename,
				description: '',
				dataSources: [
					{
						joinType: '',
						database: '',
						query: '',
					}
				],
				printTableName: true,
				filters: true,
				rowBanding: {
					on: true,
					colors: {
						useDefaults: true,
						background: ['#FFFFFF', '#FFFFFF'],
						font: ['#000000', '#000000'],
					},
				},
				totalsRow: {},
			},
		]
		this.props.updateTables(tables);
	}

	handleChange = (tableIndex, { target }, parent='') => {
		const tables = this.props.tables
		const value = target.type === 'checkbox' ? target.checked : target.value;
		if (parent) {
			tables[tableIndex][parent][target.name] = value;
		} else {
			tables[tableIndex][target.name] = value;
		}
		this.props.updateTables(tables);
	}

	handleOpenQuery = (tableIndex, dsIndex, { target }) => {
		const query = {
			open: true,
			reference: this.props.tables[tableIndex].name,
			query: this.props.tables[tableIndex].dataSources[dsIndex].query,
			tableIndex: tableIndex,
			dsIndex: dsIndex,
		}
		this.setState({
		  query: query
		})
	}

	handleUpdateQuery = (tableIndex, dsIndex, query) => {
		const tables = this.props.tables
		tables[tableIndex].dataSources[dsIndex].query = query;
		this.props.updateTables(tables);
		this.handleCancelQuery();
	}

	handleCancelQuery = () => {
		this.setState({
			query: {
				open: false,
				reference: '',
				query: '',
				tableIndex: 0,
			}
		})
	}

	handleOpenRowBanding = (tableIndex) => {
		this.setState({
		  rowBanding: {
				open: true,
				reference: this.props.tables[tableIndex].name,
				colors: this.props.tables[tableIndex].rowBanding.colors,
				tableIndex: tableIndex,
			},
		});
	}

	handleUpdateRowBanding = (tableIndex, colors) => {
		const tables = this.props.tables
		tables[tableIndex].rowBanding.colors = colors;
		this.props.updateTables(tables);
		this.handleCloseRowBanding();
	}

	handleCloseRowBanding = () => {
		this.setState({
			rowBanding: {
				open: false,
				reference: '',
				colors: {
					useDefaults: true,
					background: ['#FFFFFF', '#FFFFFF'],
					font: ['#000000', '#000000'],
				},
				tableIndex: 0,
			}
		})
	}

	handleOpenTotals = (tableIndex) => {
		this.setState({
		  totals: {
				open: true,
				reference: this.props.tables[tableIndex].name,
				columns: this.props.tables[tableIndex].totalsRow,
				tableIndex: tableIndex,
			},
		});
	}

	handleUpdateTotals = (tableIndex, totalsRow) => {
		const tables = this.props.tables
		tables[tableIndex]['totalsRow'] = totalsRow;
		this.props.updateTables(tables);
		this.handleCloseTotals();
	}

	handleCloseTotals = () => {
		this.setState({
			totals: {
				open: false,
				reference: '',
				columns: {},
				tableIndex: 0,
			},
		})
	}

	handleMoveTable = (index, direction) => {
		const move = direction == 'up' ? -1 : 1;
		const tables = this.props.tables;
		tables.splice(index + move, 0, tables.splice(index, 1)[0]);
		this.props.updateTables(tables);
	}

	handleRemoveTable = (index) => {
		const tables = this.props.tables;
		tables.splice(index, 1);
    this.props.updateTables(tables);
	}

	render() {
		const classes = this.props.classes;

		return (
				<main>
					<Typography variant="h6">
						Tables
					</Typography>
					<br/>
					{this.props.tables.map((table, index) => (
						<div key={index}>
							<Grid container
							  direction="row"
							  justify="space-between"
							  alignItems="center"
							>
								<Grid item xs={8}>
									<FormControl margin="normal" fullWidth>
										<TextField id="name" name="name"
											label="Table Name"
											autoFocus
											value={table.name}
											onChange={(e) => this.handleChange(index, e)}
										/>
									</FormControl>
								</Grid>
								{ index !== 0 &&
									<Button
										variant="outlined"
										color="primary"
										onClick={e => this.handleMoveTable(index, 'up', e)}
									>
										<ArrowUpward className={classNames(classes.iconSmall)} />
									</Button>
								}
								{ index !== (this.props.tables.length - 1) &&
									<Button
										variant="outlined"
										color="primary"
										onClick={e => this.handleMoveTable(index, 'down', e)}
									>
										<ArrowDownward className={classNames(classes.iconSmall)} />
									</Button>
								}
								<Button
									variant="outlined"
									color="primary"
									onClick={e => this.handleRemoveTable(index, e)}
								>
									<Delete className={classNames(classes.iconSmall)} />
								</Button>
							</Grid>
							<FormControl margin="normal" fullWidth>
								<TextField id="description" name="description"
								 	label="Table Description"
									multiline rowsMax="9"
									value={table.description}
									onChange={(e) => this.handleChange(index, e)} />
							</FormControl>
							<div style={{marginTop: 16}}>
								<FormControlLabel
				         	control={
				           	<Checkbox id="printTableName" name="printTableName"
										 	checked={table.printTableName}
											color="primary"
											onChange={(e) => this.handleChange(index, e)}/>
				         	}
				         	label="Print Table Name"
				        />
								<FormControlLabel
				         	control={
				           	<Checkbox id="filters" name="filters"
										 	checked={table.filters}
											color="primary"
											onChange={(e) => this.handleChange(index, e)}/>
				         	}
				         	label="Show Filter Buttons"
				        />
								<FormControlLabel
				         	control={
				           	<Checkbox id="rowBanding" name="on"
										 	checked={table.rowBanding.on}
											color="primary"
											onChange={e => this.handleChange(index, e, 'rowBanding')}/>
				         	}
				         	label="Row Banding"
									style={{marginRight: 0}}
				        />
								{ table.rowBanding.on &&
									<IconButton color="primary"
									 	onClick={e => this.handleOpenRowBanding(index, e)}
									>
										<ColorLens />
									</IconButton>
								}
							</div>
							<EditDataSources
								tableIndex={index}
								tables={this.props.tables}
								dataSources={table.dataSources}
								updateTables={this.props.updateTables}
							/>
							<br/>
							<Button
							 	color="primary"
								onClick={e => this.handleOpenTotals(index, e)}
							>
								{Object.keys(table.totalsRow).length ?
									'Edit Totals Row' :
									'Add Totals Row'
								}
							</Button>
							<Divider style={{margin: "32px 0px"}} />
						</div>
					))}
					<Button color="primary" onClick={this.handleNewTable}>
						<Add className={classNames(classes.leftIcon, classes.iconSmall)} />
						New Table
					</Button>

					<RowBandingDialog
						rowBanding={this.state.rowBanding}
						handleUpdateRowBanding={this.handleUpdateRowBanding}
						handleCloseRowBanding={this.handleCloseRowBanding}
					/>
					<TotalsRowDialog
						totals={this.state.totals}
						handleUpdateTotals={this.handleUpdateTotals}
						handleCloseTotals={this.handleCloseTotals}
					/>
				</main>
		);
	}
}

EditTables.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditTables);
