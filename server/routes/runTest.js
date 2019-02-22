const simpleReport = require('simplereport.js');
const apiResponse = require('./../apiResponse.js')();
const executeReportQueries = require('./../executeReportQueries.js')();

module.exports = function() {
  const module = {};
  module.permissionLevel = 2;

  module.fn = (req, res) => {

    executeReportQueries(req.body.report, req.app.dbo)
      .then(report => {
        simpleReport.generate(report, true)
          .then((buffer) => {

            res.json({
              isLoggedIn: req.session.isLoggedIn,
              success: true,
              messages: [],
              buffer: JSON.stringify(buffer),
            });

          })
          .catch((err) => {
            console.log(err);
            apiResponse({}, false, [err]);
          });
      });

  };

  return module;
};
