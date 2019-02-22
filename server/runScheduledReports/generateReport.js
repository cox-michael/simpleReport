const assert = require('assert');
const executeReportQueries = require('./../executeReportQueries.js')();
const updateSubscribedUsers = require('./updateSubscribedUsers.js')();
const sendNotificationEmail = require('./sendNotificationEmail.js')();
const simpleReport = require('simplereport.js');

module.exports = function() {
  const generateReport = (definition, app) => {
    return new Promise(resolve => {
      console.log('\tGenerate Reports');

      definition.filename = definition.name + '.xlsx';
      console.log('\t\t' + definition.filename);

      executeReportQueries(definition, app.dbo)
        .then(report => {
          simpleReport.generate(report, true)
            .then((buffer) => {
              // Insert into db
              app.dbo.collection('reports').insertOne({
                  definition_id: report._id,
                  filename: report.filename,
                  file: buffer, //JSON.stringify(buffer)
                  downloads: [],
                },
                (err, result) => {
                  assert.equal(err, null);
                  assert.equal(1, result.result.n);
                  assert.equal(1, result.ops.length);
                  console.log(`\t\tInserted ${definition.filename}`);
                  // console.log(result);

                  report.id = result.ops[0]._id;
                  report.definition_id = result.ops[0].definition_id;
                  // console.log('report.id', report.id);
                  // console.log('report.definition_id', report.definition_id);

                  // app.reports.push(result.ops[0]);

                  Promise.all([
                    updateSubscribedUsers(report, app),
                    sendNotificationEmail(report, app)
                  ])
                  .then(() => {
                    console.log(`\t\t${definition.filename} resolved`);
                    resolve();
                  });
                });
            })
            .catch((err) => {
              console.log(`Error simpleReport.generate with ${definition.name}`);
              resolve();
              throw new Error(err);
            });
        })
        .catch((err) => {
          console.log(`Error executeReportQueries with ${definition.name}`);
          resolve();
          throw new Error(err);
        });
    });
  };

  return generateReport;
};
