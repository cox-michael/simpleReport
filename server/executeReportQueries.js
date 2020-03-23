const odbc = require('odbc');
const sqlite3 = require('sqlite3').verbose();
const { ObjectId } = require('mongodb');

const executeReportQueries = async (report, dbo) => {
  // Get connection strings from MongoDB ////////////////////////////////////////////////////
  const connStrings = {};
  // const friendlyNames = {};
  const dsQuery = [{
    $project: {
      connString: 1,
      friendlyName: 1,
    },
  }];
  const connStrResults = await dbo.collection('connections').aggregate(dsQuery).toArray();
  connStrResults.forEach(cs => {
    connStrings[cs._id] = { connString: cs.connString, friendlyName: cs.friendlyName };
  });

  // Check for any SQLite Queries ////////////////////////////////////////////////////////////
  const sqlitePresent = report.dataSources
    .some(ds => ds.type === 'Query' && connStrings[ds.connectionId].connString === 'sqlite');

  let db;
  let insertTable;
  let querySqlite;
  const throwErr = err => { if (err) throw new Error(err); };
  if (sqlitePresent) {
    db = new sqlite3.Database(':memory:');

    insertTable = (name, table) => new Promise(resolve => {
      let columns = [];
      if (table.columns) columns = table.columns.map(c => c.name);
      if (!table.columns && table.length) columns = Object.keys(table[0]);

      if (!columns.length) { resolve(); return; }
      // console.log('inserting table with columns:', columns);

      const createStmt = `CREATE TABLE '${name}' ("${columns.join('", "')}");`;
      const insertTmp = `INSERT INTO '${name}' VALUES (${'?,'.repeat(columns.length - 1)}?);`;

      db.serialize(() => {
        db.run(createStmt, throwErr);
        const stmt = db.prepare(insertTmp, throwErr);
        table.forEach(row => stmt.run(Object.values(row), throwErr));
        stmt.finalize(resolve);
      });
    });

    querySqlite = query => new Promise((resolve, reject) => {
      db.all(query, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  // Execute data sources ////////////////////////////////////////////////////////////////////
  await report.dataSources.reduce(async (prevPromise, ds) => {
    // console.log('next reduce');
    await prevPromise;
    // console.log({ name: ds.name });

    // if sqlite
    if (ds.type === 'Query' && connStrings[ds.connectionId].connString === 'sqlite') {
      const results = await querySqlite(ds.value);
      ds.data = results;
      ds.connFriendlyName = connStrings[ds.connectionId].friendlyName;
      // console.log('about to insertTable');
      await insertTable(ds.name, results);
      // console.log('done insertingTable');
      return;
    }

    // if resource
    if (ds.type === 'Resource') {
      const query = { _id: ObjectId(ds.value) };

      const options = {
        $project: {
          data: 1,
        },
      };

      const { data } = await dbo.collection('resources').findOne(query, options);
      ds.data = data;
      ds.connFriendlyName = 'Stored Resource';
      return;
    }

    const odbcConn = await odbc.connect(connStrings[ds.connectionId].connString);
    const results = await odbcConn.query(ds.value);
    await odbcConn.close();
    ds.data = results;
    ds.connFriendlyName = connStrings[ds.connectionId].friendlyName;
    if (sqlitePresent) await insertTable(ds.name, results);
  }, Promise.resolve());

  if (db) db.close();

  // Format for SimpleReport /////////////////////////////////////////////////////////////////
  report.filename = report.name;

  if (report.reportNameType === 'Dynamic' && report.reportNameDataSourceId) {
    const reportNameData = report.dataSources
      .find(ds => ds.id === report.reportNameDataSourceId).data;
    // eslint-disable-next-line prefer-destructuring
    if (reportNameData.length) report.name = Object.values(reportNameData[0])[0];
  }
  if (report.reportNameType === 'Static' && report.reportName) report.name = report.reportName;

  if (report.reportFilenameType === 'Dynamic' && report.filenameDataSourceId) {
    const filenameData = report.dataSources
      .find(ds => ds.id === report.filenameDataSourceId).data;
    // eslint-disable-next-line prefer-destructuring
    if (filenameData.length) report.filename = Object.values(filenameData[0])[0];
  }
  if (report.reportFilenameType === 'Static' && report.reportFilename) {
    report.filename = report.reportFilename;
  }
  if (report.reportFilenameType === 'Same as Report') report.filename = report.name;

  report.sheets = report.sheets.map(s => {
    if (s.type === 'Grouping') {
      return ({
        ...s,
        data: report.dataSources.find(ds => ds.id === s.dataSourceId).data,
        connFriendlyName: report.dataSources.find(ds => ds.id === s.dataSourceId).connFriendlyName,
      });
    }
    return ({
      ...s,
      tables: Array.isArray(s.tables) ?
        s.tables.map(t => ({
          ...t,
          data: report.dataSources.find(ds => ds.id === t.dataSourceId).data,
          connFriendlyName: report.dataSources
            .find(ds => ds.id === t.dataSourceId).connFriendlyName,
        })) :
        [],
    });
  });

  return report;
};

module.exports = executeReportQueries;
