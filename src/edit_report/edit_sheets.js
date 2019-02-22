import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import classNames from 'classnames';
import TextField from '@material-ui/core/TextField';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Delete, ArrowBack, ArrowForward } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import EditTables from './edit_tables';

const styles = theme => ({
	iconSmall: {
		fontSize: 20,
	},
});

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
	      {props.children}
    </Typography>
	  );
}

TabContainer.propTypes = {
	  children: PropTypes.node.isRequired,
};

class EditSheets extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      tab: 0,
    }
	}

	handleChange = (index, { target }) => {
		const sheets = this.props.sheets;
    const value = target.type === 'checkbox' ? target.checked : target.value;
		sheets[index][target.name] = value;
    this.props.updateSheets(sheets);
	}

	updateTables = (tables) => {
		const sheets = this.props.sheets;
		sheets[this.state.tab].tables = tables;
    this.props.updateSheets(sheets);
	}

	handleTabChange = (event, value) => {
		this.setState({
			tab: value
		});
		if (value == (this.props.sheets.length)) {
			var i = 1;
			while (this.props.sheets.some(sheet => sheet.name === ('sheet'+i))) {
				i += 1;
			}
			var new_sheetname = 'sheet' + i
      this.props.updateSheets([
        ...this.props.sheets,
        {
          'name': new_sheetname,
          description: '',
          printReportName: true,
          printSheetName: true,
          tables: []}
      ]);
		}
	}

	removeSheet = (sheetIndex, { target }) => {
		var tab = this.state.tab;
		const sheets = this.props.sheets;
		if (tab == (sheets.length - 1)) {
			tab -= 1;
		}
		sheets.splice(this.state.tab, 1);
		this.setState({
			tab: tab,
		});
    this.props.updateSheets(sheets);
	}

	moveSheet = (direction, sheetIndex, { target }) => {
		var move = direction == 'left' ? -1 : 1;
		const sheets = this.props.sheets;
		sheets.splice(sheetIndex + move, 0, sheets.splice(sheetIndex, 1)[0]);
		this.setState({
			tab: sheetIndex + move
		});
    this.props.updateSheets(sheets);
	}

	render() {
		const classes = this.props.classes;

		return (
				<main>
					<Typography component="h1" variant="h5" align="center">
						Sheets
					</Typography>
					<Tabs scrollable
            value={this.state.tab}
            onChange={this.handleTabChange}
          >
						{[...this.props.sheets, {'name': '+'}].map(sheet => (
							<Tab
                label={sheet.name}
                key={sheet.name}
                style={{textTransform: 'none'}}
              />
						))}
					</Tabs>
					<TabContainer>
						<Grid container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
							<Grid item>
							 {this.state.tab != 0 &&
								<Button
                  variant="outlined"
                  color="primary"
                  onClick={(e) => this.moveSheet('left', this.state.tab, e)}>
									<ArrowBack className={classNames(classes.iconSmall)} />
								</Button>
							 }
							</Grid>
							<Grid item>
							 {this.props.sheets.length > 1 &&
								<Button
                  variant="outlined"
                  color="primary"
                  onClick={(e) => this.removeSheet(this.state.tab, e)}>
									<Delete className={classNames(classes.iconSmall)} />
								</Button>
							 }
							</Grid>
							<Grid item>
							 {this.props.sheets.length - 1 != this.state.tab &&
								<Button
                  variant="outlined"
                  color="primary"
                  onClick={(e) => this.moveSheet('right', this.state.tab, e)}>
									<ArrowForward className={classNames(classes.iconSmall)} />
								</Button>
							 }
							</Grid>
						</Grid>
						<FormControl margin="normal" required fullWidth>
							<TextField id="name" label="Sheet Name" name="name"
									value={this.props.sheets[this.state.tab].name}
									onChange={(e) => this.handleChange(this.state.tab, e)} />
						</FormControl>
						<FormControl margin="normal" required fullWidth>
							<TextField id="description" name="description"
                label="Sheet Description"
								 multiline rowsMax="9"
								 value={this.props.sheets[this.state.tab].description}
								 onChange={(e) => this.handleChange(this.state.tab, e)}
              />
						</FormControl>
            <div style={{marginTop: 16}}>
              <FormControlLabel
                 control={
                   <Checkbox id="printReportName" name="printReportName"
                     checked={ this.props.sheets[this.state.tab].printReportName }
                     color="primary"
                     onChange={(e) => this.handleChange(this.state.tab, e)}/>
                 }
                 label="Print Report Name"
              />
              <FormControlLabel
                control={
                  <Checkbox id="printSheetName" name="printSheetName"
                    checked={ this.props.sheets[this.state.tab].printSheetName }
                    color="primary"
                    onChange={(e) => this.handleChange(this.state.tab, e)}/>
                }
                label="Print Sheet Name"
              />
            </div>
						<br/><br/>

						<div>
							<EditTables
                tables={this.props.sheets[this.state.tab].tables}
                updateTables={this.updateTables}
              />
						</div>
					</TabContainer>
				</main>
		);
	}
}

EditSheets.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditSheets);
