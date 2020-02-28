import React, { useState, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import reducer from './reducer';

const DefDispatch = React.createContext(null);
const DefContext = React.createContext(null);
const FormatContext = React.createContext(null);

const initDefinition = definition => {
  console.log('initDefinition called', { definition });
  if (!definition.name) definition.name = 'New Definition';
  if (!definition.sheets) definition.sheets = [];
  return { ...definition };
};

const EditDefinitionProvider = props => {
  const { children, definition: definitionOriginal } = props;
  const [definition, dispatch] = useReducer(reducer, definitionOriginal, initDefinition);
  // const [dialogOpen, setDialogOpen] = useState(false);
  const [formatDialog, setFormatDialog] = useState({
    dialogOpen: false,
  });

  useEffect(() => dispatch([{ reset: true }, definitionOriginal]), [definitionOriginal]);

  // const formatDialog = {
  //   dialogOpen,
  //   setDialogOpen,
  //   format,
  //   nav: { sheetIndex: tab },
  //   name: 'nameFormat',
  //   sample: sheets[tab].name,
  // };

  return (
    <DefDispatch.Provider value={dispatch}>
      <DefContext.Provider value={definition}>
        <FormatContext.Provider value={{ formatDialog, setFormatDialog }}>
          {children}
        </FormatContext.Provider>
      </DefContext.Provider>
    </DefDispatch.Provider>
  );
};

EditDefinitionProvider.propTypes = {
  children: PropTypes.node.isRequired,
  definition: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    dept: PropTypes.string,
    requestedBy: PropTypes.string,
    exceptionsReport: PropTypes.bool,
    dataSources: PropTypes.arrayOf(PropTypes.shape({
      ordinal: PropTypes.number,
      type: PropTypes.string,
      value: PropTypes.string,
      database: PropTypes.string,
    })),
  }).isRequired,
};

export {
  DefDispatch, DefContext, FormatContext, EditDefinitionProvider,
};
