import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom';
// import { useFetch } from '../hooks';
import { EditDefinitionProvider } from './Context';
import EditDefLayout from './EditDefLayout';
import { Spinner } from '../components';
import { useFetch } from '../hooks';

const blankDef = {
  name: 'New Definition',
  sheets: [
    {
      // tables: PropTypes.array,
      name: 'sheet1',
      printSheetName: true,
      printReportName: true,
      description: '',
    },
  ],
};

const EditDefinition = () => {
  const { _id } = useParams();

  const [definition, setDefinition] = useState(blankDef);

  const [getDefinition, loading] = useFetch('getDefinition', setDefinition);

  useEffect(() => {
    if (_id !== 'new') {
      getDefinition({ _id });
      return;
    }
    setDefinition(blankDef);
  }, [_id]);

  if (loading) return <Spinner centerScreen />;

  // componentDidMount() {
  //   if (!newDef) {
  //     fetch(`${process.env.API_URL}api/returnDefinition`, {
  //       method: 'POST',
  //       credentials: 'same-origin',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         reportId: this.props.match.params.report_id,
  //       }),
  //     })
  //       .then(response => response.json())
  //       .then(response => {
  //         if (!response.isLoggedIn) {
  //           this.context.handleLoginStatusChange(false);
  //           return;
  //         } if (response.messages[0] == 'You do not have permissions to do this') {
  //           window.location.href = `${process.env.API_URL}notPermitted`;
  //         }

  //         this.setState({
  //           loading: false,
  //           saved: false,
  //           tab: 0,
  //           report: response.data,
  //         });
  //       });
  //   }

  //   this.context.loadDatabases();
  // }

  return (
    <EditDefinitionProvider {...{ definition }}>
      <EditDefLayout />
    </EditDefinitionProvider>
  );
};

export default EditDefinition;
