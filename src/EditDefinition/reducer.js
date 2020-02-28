module.exports = (definition, [nav, updated]) => {
  console.log('reducer', { nav, updated });

  const updateLevelZero = ({ name, value }) => ({ ...definition, [name]: value });

  const updateLevelOne = (arrName, index, { name, value }) => {
    const itemsArr = [...definition[arrName]];
    itemsArr[index] = { ...itemsArr[index], [name]: value };
    return updateLevelZero({ name: arrName, value: itemsArr });
  };

  // Reorder /////////////////////////////////////////////////////////////////////////////////
  if (nav.reorder && nav.sheetIndex !== undefined) {
    const { oldIndex, newIndex } = updated;
    const tables = [...definition.sheets[nav.sheetIndex].tables];
    tables.splice(newIndex, 0, tables.splice(oldIndex, 1)[0]);
    return updateLevelOne('sheets', nav.sheetIndex, { name: 'tables', value: tables });
  }

  if (nav.reorder) {
    const { oldIndex, newIndex } = updated;
    definition[nav.reorder].splice(newIndex, 0, definition[nav.reorder].splice(oldIndex, 1)[0]);
    return { ...definition, [nav.reorder]: [...definition[nav.reorder]] };
  }

  // Tables ///////////////////////////////////////////////////////////////////////////////////
  // if (fn === 'moveTable') {
  //   const { sheetIndex, tableIndex, direction } = updated;

  //   const sheet = { ...sheets[sheetIndex] };
  //   const { tables } = sheet;

  //   const move = direction === 'up' ? -1 : 1;
  //   tables.splice(tableIndex + move, 0, tables.splice(tableIndex, 1)[0]);

  //   sheet.tables = [...tables];

  //   const updatedSheets = [...sheets];
  //   updatedSheets[sheetIndex] = sheet;
  //   return { ...definition, sheets: updatedSheets };
  // }

  if (nav.tableIndex !== undefined) {
    const { name, value } = updated;
    const tables = [...definition.sheets[nav.sheetIndex].tables];
    tables[nav.tableIndex] = { ...tables[nav.tableIndex], [name]: value };
    return updateLevelOne('sheets', nav.sheetIndex, { name: 'tables', value: [...tables] });
  }

  // Sheets ///////////////////////////////////////////////////////////////////////////////////
  if (nav.sheetIndex !== undefined) return updateLevelOne('sheets', nav.sheetIndex, updated);

  // DataSources /////////////////////////////////////////////////////////////////////////////
  if (nav.dataSourceIndex !== undefined) return updateLevelOne('dataSources', nav.dataSourceIndex, updated);

  // Definition //////////////////////////////////////////////////////////////////////////////
  if (!Object.keys(nav).length) return updateLevelZero(updated);

  // Reset ///////////////////////////////////////////////////////////////////////////////////
  if (nav.reset) return updated;

  // Error ///////////////////////////////////////////////////////////////////////////////////
  return definition;
};
