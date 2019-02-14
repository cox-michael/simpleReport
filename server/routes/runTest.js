const simpleReport = require('simplereport.js');
const odbc = require('odbc');
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
				console.log("the database connection is now closed");
			});
		});
	});
};

const loopTable = table => {
  console.log('\tstarting ' + table.name);
  return new Promise(resolve => {
    // // TODO: remove the following line
    const connectionString = "DRIVER=FreeTDS;SERVER=SFLGNVWRH01\\WAREHOUSE;PORT=51172;DATABASE=USER_DW;UID=disposableuser;PWD=d!sp0sable;";
    queryData(connectionString, table.query)
      .then(results => {
        console.log('Query results:');
        console.log(results);
        table.data = results;
        console.log('\tresolve ' + table.name);
        resolve(table);
      });
  });
};

const loopSheet = sheet => {
  console.log('starting ' + sheet.name);
  return new Promise(resolve => {
    sheet.tables.reduce(
      (chain, table) => chain.then(() => loopTable(table)),
      Promise.resolve()
    ).then(() => {
      console.log('resolve ' + sheet.name);
      resolve(sheet);
    });
  });
};

module.exports = function() {
    const module = {};
    module.permissionLevel = 2;

    module.fn = (req, res) => {

      // user reduce to loop through the sheets and wait for promise before next
      req.body.report.sheets.reduce(
          (chain, sheet) => chain.then(() => loopSheet(sheet)),
          Promise.resolve()
        )
        .then(() => {
          simpleReport.generate(req.body.report, buffer=true)
            .then((buffer) => {
              // const downloadUrl = (process.env.API_URL + "downloadTest/" +
              //   req.session.realUserid + '.xlsx');
              res.json({
                isLoggedIn: req.session.isLoggedIn,
                success: true,
                messages: [],
                buffer: JSON.stringify(buffer),
              });

            })
            .catch((err) => console.log(err));
        });
    };

  return module;
};
