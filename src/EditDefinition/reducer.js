module.exports = (definition, [nav, ...updates]) => {
  if (process.env.NODE_ENV !== 'production') console.log('reducer', { nav, updates });

  const updatedDef = updates.reduce((prevDef, updated, idx) => {
    if (process.env.NODE_ENV !== 'production') console.log({ ending: idx - 1, prevDef });

    const updateLevelZero = ({ name, value }) => ({ ...prevDef, [name]: value });

    const updateLevelOne = (arrName, index, { name, value }) => {
      const itemsArr = [...prevDef[arrName]];
      itemsArr[index] = { ...itemsArr[index], [name]: value };
      return updateLevelZero({ name: arrName, value: itemsArr });
    };

    if (process.env.NODE_ENV !== 'production') console.log({ starting: idx });
    // Reorder /////////////////////////////////////////////////////////////////////////////////
    if (nav.reorder && nav.sheetIndex !== undefined) {
      const { oldIndex, newIndex } = updated;
      const tables = [...prevDef.sheets[nav.sheetIndex].tables];
      tables.splice(newIndex, 0, tables.splice(oldIndex, 1)[0]);
      return updateLevelOne('sheets', nav.sheetIndex, { name: 'tables', value: tables });
    }

    if (nav.reorder) {
      const { oldIndex, newIndex } = updated;
      prevDef[nav.reorder].splice(newIndex, 0, prevDef[nav.reorder].splice(oldIndex, 1)[0]);
      return { ...prevDef, [nav.reorder]: [...prevDef[nav.reorder]] };
    }

    // Tables ///////////////////////////////////////////////////////////////////////////////////
    if (nav.tableIndex !== undefined) {
      const { name, value } = updated;
      const tables = [...prevDef.sheets[nav.sheetIndex].tables];
      tables[nav.tableIndex] = { ...tables[nav.tableIndex], [name]: value };
      return updateLevelOne('sheets', nav.sheetIndex, { name: 'tables', value: [...tables] });
    }

    // Sheets ///////////////////////////////////////////////////////////////////////////////////
    if (nav.sheetIndex !== undefined) { return updateLevelOne('sheets', nav.sheetIndex, updated); }

    // DataSources /////////////////////////////////////////////////////////////////////////////
    if (nav.dataSourceIndex !== undefined) { return updateLevelOne('dataSources', nav.dataSourceIndex, updated); }

    // Definition //////////////////////////////////////////////////////////////////////////////
    if (!Object.keys(nav).length) { return updateLevelZero(updated); }

    // Reset ///////////////////////////////////////////////////////////////////////////////////
    if (nav.reset) return updated;

    // Error ///////////////////////////////////////////////////////////////////////////////////
    return updated;
  }, definition);

  if (process.env.NODE_ENV !== 'production') console.log({ updatedDef });

  return updatedDef;
};
