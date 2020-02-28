const { ObjectId } = require('mongodb');

module.exports = async (report, dbo) => {
  // Get theme from MongoDB //////////////////////////////////////////////////////////////////
  const theme = await dbo.collection('themes').findOne({ _id: ObjectId(report.themeId) });
  const {
    reportNameFormat, sheetNameFormat, tableNameFormat, rowBanding, columnNamesFormat,
  } = theme;

  const formatTable = t => {
    // Table Name
    if (!t.nameFormat || t.nameFormat.useDefaults) t.nameFormat = tableNameFormat;
    // Row Banding
    if (!t.rowBanding || (t.rowBanding.on && t.rowBanding.useDefaults)) {
      t.rowBanding = rowBanding;
    }
    // Column Names
    if (!t.columnNamesFormat || t.columnNamesFormat.useDefaults) {
      t.columnNamesFormat = columnNamesFormat;
    }
    return t;
  };

  // Report Level ////////////////////////////////////////////////////////////////////////////
  if (!report.nameFormat || report.nameFormat.useDefaults) report.nameFormat = reportNameFormat;

  // Sheet & Table Level /////////////////////////////////////////////////////////////////////
  report.sheets = report.sheets
    .map(s => {
      if (!s.nameFormat || s.nameFormat.useDefaults) s.nameFormat = sheetNameFormat;

      if (s.table) s.table = formatTable(s.table);

      if (s.tables && Array.isArray(s.tables)) s.tables = s.tables.map(t => formatTable(t));

      return s;
    });

  // console.log(report);
  return report;
};
