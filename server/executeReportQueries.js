const odbc = require('odbc');

const log = false;

const queryData = (connectionString, query) => {
	return new Promise((resolve, reject) => {
		var db = new odbc.Database();
		db.open(connectionString, err => {
			if (err) reject(err.message);

			// TODO: find out if moreResultSets is necessary
			db.query(query, (err, rows, moreResultSets) => {
				if (err) reject(err.message);
				resolve(rows);
			});
			db.close(err => { // TODO: switch err to () and make sure it works
				if (log) console.log("the database connection is now closed");
			});
		});
	});
};

const loopDataSource =(connStrings, dataSource) => {
  if (log) console.log('\t\tstarting dataSource');
  return new Promise(resolve => {
    const connectionString = connStrings.filter(conn => conn._id == dataSource.database)[0].connectionString;
    queryData(connectionString, dataSource.query)
      .then(results => {
        // console.log('Query results:');
        // console.log(results);
        dataSource.data = results;
        if (log) console.log('\t\tresolve dataSource');
        resolve(dataSource);
      })
      .catch(err => resolve(err));
  });
};

const loopTable =(connStrings, table) => {
  if (log) console.log('\tstarting table: ' + table.name);
  return new Promise(resolve => {
    if (!Array.isArray(table.dataSources)) {
      if (log) console.log('\trejecting');
      resolve();
    }
    table.dataSources.reduce(
      (chain, dataSource) => chain.then(() => loopDataSource(connStrings, dataSource)),
      Promise.resolve()
    ).then(() => {
      // TODO: This is where the logic goes for combining (Union and Join) the
      // data. Consider how grouping across queries would work.
      if (table.dataSources && table.dataSources.length) {
        table.data = table.dataSources[0].data;
      }
      if (log) console.log('\tresolve table: ' + table.name);
      resolve(table);
    });
  });
};

const loopSheet = (connStrings, sheet) => {
  if (log) console.log('starting sheet: ' + sheet.name);
  return new Promise(resolve => {
    sheet.tables.reduce(
      (chain, table) => chain.then(() => loopTable(connStrings, table)),
      Promise.resolve()
    ).then(() => {
      if (log) console.log('resolve sheet: ' + sheet.name);
      resolve(sheet);
    });
  });
};

module.exports = function() {

    const executeReportQueries = (report, dbo) => {
      return new Promise(resolve => {

        const dsQuery = [{
          "$sort": {
            "name": 1
          }
        }];

        dbo.collection('dataSources').aggregate(dsQuery).toArray((err, connStrings) => {
          // user reduce to loop through the sheets and wait for promise before next
          report.sheets.reduce(
              (chain, sheet) => chain.then(() => loopSheet(connStrings, sheet)),
              Promise.resolve()
            )
            .then(() => resolve(report));
        });

      });
    };

  return executeReportQueries;
};
