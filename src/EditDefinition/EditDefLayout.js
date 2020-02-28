import React, { useState, useContext, useRef } from 'react';
// import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Paper,
  Stepper,
  Step,
  StepButton,
} from '@material-ui/core';
import { Row } from '../components';
import Actions from './Actions';
import FormatDialog from './FormatDialog';
import EditDataSources from './EditDataSources';
import EditSheets from './EditSheets';
import EditProperties from './EditProperties';
// import SelectTheme from './SelectTheme';
import { DefContext, FormatContext } from './Context';

const useStyles = makeStyles(theme => ({
  layout: {
    width: 'auto',
    minWidth: 800,
    maxWidth: 1200,
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  paper: {
    marginBottom: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(3)}px`,
  },
}));

const EditDefinition = () => {
  const classes = useStyles();
  const definition = useContext(DefContext);
  const { formatDialog } = useContext(FormatContext);

  const [activeStep, setActiveStep] = useState(0);

  const el = useRef(null);

  const steps = [/* 'Theme', */'Definition Properties', 'Data Sources', 'Sheets'];

  const handleStep = step => () => setActiveStep(step);

  const { dataSources, sheets } = definition;

  const width = (el && el.current) ? window.getComputedStyle(el.current).width : 1200;

  return (
    <>
      <Actions {...{ definition }} />

      <Row justifyContent="center">
        <div style={{ width }}>
          <Stepper alternativeLabel nonLinear activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps = { completed: false };
              const buttonProps = {};

              return (
                <Step key={label} {...stepProps}>
                  <StepButton
                    onClick={handleStep(index)}
                    completed={stepProps.completed}
                    {...buttonProps}
                  >
                    {label}
                  </StepButton>
                </Step>
              );
            })}
          </Stepper>
        </div>
      </Row>

      <Row justifyContent="center">
        <div className={classes.layout} ref={el}>
          <Paper className={classes.paper}>
            {/* {activeStep === 0 && <SelectTheme {...definition} />} */}

            {activeStep === 0 && <EditProperties {...definition} />}

            {activeStep === 1 && <EditDataSources {...{ dataSources }} />}

            {activeStep === 2 && <EditSheets {...{ sheets }} />}

            {/* <EditPermissions
              permissions={definition.permissions}
              updatePermissions={this.updatePermissions}
            /> */}
          </Paper>
        </div>
      </Row>

      <Row justifyContent="center">
        <Row justifyContent="space-between" style={{ width }}>
          <Button
            onClick={() => setActiveStep(activeStep - 1)}
            disabled={activeStep === 0}
            color="primary"
          >
            Back
          </Button>
          <Button
            onClick={() => setActiveStep(activeStep + 1)}
            disabled={activeStep === steps.length - 1}
            color="primary"
          >
            Next
          </Button>
        </Row>
      </Row>

      <FormatDialog {...formatDialog} />
    </>
  );
};

export default EditDefinition;
