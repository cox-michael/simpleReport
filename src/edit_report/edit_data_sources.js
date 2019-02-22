import React, { Component } from 'react'
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import { Add } from '@material-ui/icons';
import classNames from 'classnames';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import QueryDialog from './query_dialog';
import IconButton from '@material-ui/core/IconButton';
import { Delete, ArrowUpward, ArrowDownward, Help } from '@material-ui/icons';
import { SessionContext, SessionProvider } from "./../session";
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
	leftIcon: {
		marginRight: theme.spacing.unit,
	},
	iconSmall: {
		fontSize: 20,
	},
  formControl: {
		marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit * 2,
    minWidth: 120,
  },
	tooltipText: {
		fontSize: 16,
	},
	toolTipIcon: {
		fontSize: 18,
		color: 'rgba(0, 0, 0, 0.5)',
	},
});

class EditDataSources extends React.Component {
	static contextType = SessionContext;
	constructor(props) {
		super(props);
		// console.log(this.props);
		this.state = {
			query: {
				open: false,
				reference: '',
				query: '',
				tableIndex: 0,
			},
		};
	}

	handleNewDataSource = () => {
		const tables = this.props.tables;
		tables[this.props.tableIndex].dataSources.push({
			joinType: '',
			database: '',
			query: '',
		});
		this.props.updateTables(tables);
	}

	handleChange = (dsIndex, {target}) => {
		const tables = this.props.tables;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		tables[this.props.tableIndex].dataSources[dsIndex][target.name] = value;
		this.props.updateTables(tables);
	}

	handleOpenQuery = (dsIndex, { target }) => {
		const query = {
			open: true,
			reference: this.props.tables[this.props.tableIndex].name,
			query: this.props.tables[this.props.tableIndex].dataSources[dsIndex].query,
			dsIndex: dsIndex,
		}
		this.setState({
		  query: query
		})
	}

	handleUpdateQuery = (dsIndex, query) => {
		const tables = this.props.tables;
		tables[this.props.tableIndex].dataSources[dsIndex].query = query;
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

	render() {
		const classes = this.props.classes;

		return (
				<main>
					{ this.props.dataSources.map((ds, dsIndex) => {
						return (
							<React.Fragment key={dsIndex}>
								{ dsIndex !== 0 &&
									<FormControl className={classes.formControl}>
										<InputLabel htmlFor="joinType">Join Type</InputLabel>
										<Select
											value={ds.joinType}
											onChange={(e) => this.handleChange(dsIndex, e)}
											inputProps={{
												name: 'joinType',
												id: 'joinType',
											}}
										>
											<MenuItem value=""><em>None</em></MenuItem>
											<MenuItem value="Union All">Union All</MenuItem>
											<MenuItem value="Left Join">Left Join</MenuItem>
											<MenuItem value="Right Join">Right Join</MenuItem>
											<MenuItem value="Inner Join">Inner Join</MenuItem>
										</Select>
									</FormControl>
								}
								<FormControl className={classes.formControl}>
									<InputLabel htmlFor="database">Database</InputLabel>
									<Select
										value={ds.database}
										onChange={(e) => this.handleChange(dsIndex, e)}
										inputProps={{
											name: 'database',
											id: 'database',
										}}
									>
										<MenuItem value="">
											<em>None</em>
										</MenuItem>
										{ this.context.databases.map(db => {
											return (
												<MenuItem key={db._id} value={db._id}>
													{ db.name }
												</MenuItem>
											)
										})}
									</Select>
								</FormControl>
								<Button
								 	color="primary"
									onClick={e => this.handleOpenQuery(dsIndex, e)}
									style={{margin: "16px 0px 0px 0px"}}
								>
									Edit Query
								</Button>
								{ ds.joinType === 'Union All' && dsIndex !== 0 &&
									<Tooltip
										title={ dsIndex === 1 ? (
											<span className={classes.tooltipText}>
												The column names from the query above must exactly match (case sensitive) the column names from this query.
											</span>) : (
											<span className={classes.tooltipText}>
												The column names from the combined queries above must exactly match (case sensitive) the column names from this query.
											</span>)
										}
										placement="right"
									>
										<Help className={classes.toolTipIcon} />
									</Tooltip>
								}
								{ ds.joinType.includes('Join') && dsIndex !== 0 &&
									<Tooltip
										title={ dsIndex === 1 ? (
											<span className={classes.tooltipText}>
												Any column names from the query above that exactly match (case sensitive) a column name from this query will be joined on.
											</span>) : (
											<span className={classes.tooltipText}>
												Any column names from the combined queries above that exactly match (case sensitive) a column name from this query will be joined on.
											</span>)
										}
										placement="right"
									>
										<Help className={classes.toolTipIcon} />
									</Tooltip>
								}
								<br/>
							</React.Fragment>
						)
					})}
					<Button color="primary" onClick={this.handleNewDataSource}>
						<Add className={classNames(classes.leftIcon, classes.iconSmall)} />
						Join Another Query
					</Button>

					<QueryDialog
						query={this.state.query}
						handleUpdateQuery={this.handleUpdateQuery}
						handleCancelQuery={this.handleCancelQuery}
					/>
				</main>
		);
	}
}

EditDataSources.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditDataSources);
